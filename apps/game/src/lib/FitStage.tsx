import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Scales a fixed-width scene DOWN to fit the available width (never up), keeping the
 *  design's exact pixel layout at every viewport size from desktop to tablet. The scene
 *  is authored at `width` px; on narrower screens it shrinks uniformly and the wrapper
 *  collapses to the scaled height so surrounding flow stays correct.
 *
 *  Note: `transform: scale()` establishes a containing block for `position: fixed`
 *  descendants — keep any full-screen fixed overlays OUTSIDE this wrapper. */
export function FitStage({ width, children }: { width: number; children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const content = contentRef.current
    if (!wrap || !content) return
    const measure = () => {
      const avail = wrap.clientWidth
      const s = Math.min(1, avail / width)
      setScale(s)
      // offsetHeight is the pre-transform layout height, so this stays stable as `s` changes.
      setHeight(content.offsetHeight * s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(content)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', height }}>
      <div
        ref={contentRef}
        style={{
          width,
          flexShrink: 0,
          transformOrigin: 'top center',
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
