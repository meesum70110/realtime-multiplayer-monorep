import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

export type FabPos = { x: number; y: number }

/** 0–1 along the movable range (0 = left/top edge, 1 = right/bottom edge). */
type FabFrac = { fx: number; fy: number }

/** Pixels of movement before a press counts as a drag. */
const DRAG_THRESHOLD_PX = 20

/** Snap back to the home corner if released near it. */
const DOCK_SNAP_PX = 40

function clampPos(p: FabPos, width: number, height: number): FabPos {
  const maxX = Math.max(0, window.innerWidth - width)
  const maxY = Math.max(0, window.innerHeight - height)
  return {
    x: Math.min(maxX, Math.max(0, p.x)),
    y: Math.min(maxY, Math.max(0, p.y)),
  }
}

function toFrac(p: FabPos, width: number, height: number): FabFrac {
  const maxX = Math.max(1, window.innerWidth - width)
  const maxY = Math.max(1, window.innerHeight - height)
  return {
    fx: Math.min(1, Math.max(0, p.x / maxX)),
    fy: Math.min(1, Math.max(0, p.y / maxY)),
  }
}

function fromFrac(f: FabFrac, width: number, height: number): FabPos {
  const maxX = Math.max(0, window.innerWidth - width)
  const maxY = Math.max(0, window.innerHeight - height)
  return clampPos({ x: f.fx * maxX, y: f.fy * maxY }, width, height)
}

function dockPos(
  width: number,
  height: number,
  defaultLeft: number,
  defaultRight: number | undefined,
  defaultBottom: number,
): FabPos {
  return clampPos(
    {
      x: defaultRight != null ? window.innerWidth - defaultRight - width : defaultLeft,
      y: window.innerHeight - defaultBottom - height,
    },
    width,
    height,
  )
}

/**
 * Mute + chat FAB positioning.
 * - Always starts CSS-docked (same bottom, mirrored side inset).
 * - After drag: keeps a *proportional* spot so resize keeps the same relative place.
 * - Dropping near the home corner re-docks.
 * - No localStorage — fresh game/reload always starts docked.
 */
export function useDraggableFab(opts: {
  storageKey: string
  defaultLeft?: number
  defaultRight?: number
  defaultBottom: number
  width: number
  height: number
  zIndex?: number
  onTap?: () => void
}) {
  const {
    defaultLeft = 8,
    defaultRight,
    defaultBottom,
    width,
    height,
    zIndex = 999,
    onTap,
  } = opts

  // storageKey kept for call-site compatibility (legacy keys are cleared in fabDock).
  void opts.storageKey

  const [pos, setPos] = useState<FabPos | null>(null)
  const [dragging, setDragging] = useState(false)
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap
  const sizeRef = useRef({ width, height })
  sizeRef.current = { width, height }
  const dockOptsRef = useRef({ defaultLeft, defaultRight, defaultBottom })
  dockOptsRef.current = { defaultLeft, defaultRight, defaultBottom }
  const fracRef = useRef<FabFrac | null>(null)

  const drag = useRef<{
    tracking: boolean
    dragging: boolean
    startX: number
    startY: number
    origX: number
    origY: number
    pointerId: number
    target: HTMLElement | null
  } | null>(null)

  // Keep a free-placed FAB locked to its screen proportion on resize / size change.
  useEffect(() => {
    if (!fracRef.current) return
    const apply = () => {
      const f = fracRef.current
      if (!f) return
      const { width: w, height: h } = sizeRef.current
      setPos(fromFrac(f, w, h))
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [width, height])

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    drag.current = {
      tracking: true,
      dragging: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      pointerId: e.pointerId,
      target: e.currentTarget,
    }
  }, [])

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d?.tracking) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.dragging && dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
      d.dragging = true
      setDragging(true)
      try {
        d.target?.setPointerCapture(d.pointerId)
      } catch {
        /* ignore */
      }
    }
    if (!d.dragging) return
    e.preventDefault()
    const { width: w, height: h } = sizeRef.current
    const next = clampPos({ x: d.origX + dx, y: d.origY + dy }, w, h)
    fracRef.current = toFrac(next, w, h)
    setPos(next)
  }, [])

  const endPointer = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d?.tracking) return
    const wasDragging = d.dragging
    drag.current = null
    setDragging(false)
    try {
      if (wasDragging && d.target?.hasPointerCapture(d.pointerId)) {
        d.target.releasePointerCapture(d.pointerId)
      }
    } catch {
      /* ignore */
    }
    if (wasDragging) {
      const { width: w, height: h } = sizeRef.current
      const { defaultLeft: l, defaultRight: r, defaultBottom: b } = dockOptsRef.current
      const home = dockPos(w, h, l, r, b)
      setPos((p) => {
        if (!p) return null
        const next = clampPos(p, w, h)
        const dx = next.x - home.x
        const dy = next.y - home.y
        if (dx * dx + dy * dy <= DOCK_SNAP_PX * DOCK_SNAP_PX) {
          fracRef.current = null
          return null
        }
        fracRef.current = toFrac(next, w, h)
        return next
      })
      e.preventDefault()
      return
    }
    onTapRef.current?.()
  }, [])

  const free = pos !== null

  const shellStyle: CSSProperties = free
    ? {
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        right: 'auto',
        bottom: 'auto',
        zIndex,
        touchAction: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxSizing: 'border-box',
      }
    : {
        position: 'fixed',
        ...(defaultRight != null
          ? { right: defaultRight, left: 'auto' as const }
          : { left: defaultLeft, right: 'auto' as const }),
        bottom: defaultBottom,
        top: 'auto',
        zIndex,
        touchAction: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxSizing: 'border-box',
      }

  return {
    ready: true,
    shellStyle,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
    },
  }
}
