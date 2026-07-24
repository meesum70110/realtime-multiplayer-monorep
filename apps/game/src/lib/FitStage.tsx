import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useIsDesktop } from '@/lib/useBreakpoint'

/** Scales a fixed-size scene DOWN to fit the available space (never up), keeping the
 *  design's exact pixel layout on desktop/tablet (>= 768px).
 *
 *  Layout size matches the *visual* scaled size (transform scale alone does not),
 *  so bottom content like the clash verdict countdown is not clipped by overflow.
 *
 *  On mobile (< 768px), scaling is disabled by default: fluid width + vertical scroll.
 *  Pass `alwaysScale` to keep scale-to-fit on mobile (ClashStage choreography).
 *
 *  Note: `transform: scale()` establishes a containing block for `position: fixed`
 *  descendants — keep any full-screen fixed overlays OUTSIDE this wrapper. */
export function FitStage({
  width,
  children,
  alwaysScale = false,
}: {
  width: number
  children: ReactNode
  alwaysScale?: boolean
}) {
  const isDesktop = useIsDesktop()
  const useScale = isDesktop || alwaysScale
  const wrapRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [natH, setNatH] = useState(0)

  useLayoutEffect(() => {
    if (!useScale) {
      setScale(1)
      setNatH(0)
      return
    }

    const wrap = wrapRef.current
    const content = contentRef.current
    if (!wrap || !content) return

    const measure = () => {
      const availW = wrap.clientWidth
      const availH = wrap.clientHeight || window.innerHeight
      const contentH = content.scrollHeight || content.offsetHeight || 1
      const s = Math.min(1, availW / width, availH / contentH)
      setNatH(contentH)
      setScale(Number.isFinite(s) && s > 0 ? s : 1)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(content)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [width, useScale])

  if (!useScale) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', boxSizing: 'border-box', height: '100%' }}>{children}</div>
      </div>
    )
  }

  const s = scale
  const layoutH = natH > 0 ? natH * s : undefined

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer box = visual size so flex/overflow math matches what you see. */}
      <div
        style={{
          width: width * s,
          height: layoutH,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          ref={contentRef}
          style={{
            width,
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: s < 1 ? `scale(${s})` : undefined,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
