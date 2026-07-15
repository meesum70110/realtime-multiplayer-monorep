import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Scales a fixed-size scene DOWN to fit the available space (never up), keeping the
 *  design's exact pixel layout at every viewport size from desktop to tablet. The scene
 *  is authored at `width` px wide; it shrinks uniformly to fit both the available width
 *  AND the available height (so it never overflows into the header or off the bottom),
 *  and the wrapper collapses to the scaled height so surrounding flow stays correct.
 *
 *  Available height is read from the nearest `<main>` ancestor (a stable flex container
 *  that excludes the fixed header), avoiding any measure→resize feedback loop.
 *
 *  Note: `transform: scale()` establishes a containing block for `position: fixed`
 *  descendants — keep any full-screen fixed overlays OUTSIDE this wrapper. */
export function FitStage({ width, children }: { width: number; children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [boxHeight, setBoxHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const content = contentRef.current
    if (!wrap || !content) return

    let main: HTMLElement | null = wrap.parentElement
    while (main && main.tagName !== 'MAIN') main = main.parentElement

    const measure = () => {
      const availW = wrap.clientWidth
      const availH = main ? main.clientHeight : window.innerHeight
      // offsetWidth/Height are the pre-transform layout size, so they stay stable as scale changes.
      const natW = width
      const natH = content.offsetHeight || 1
      const s = Math.min(1, availW / natW, availH / natH)
      setScale(s)
      setBoxHeight(natH * s)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(content)
    if (main) ro.observe(main)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [width])

  return (
    <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', height: boxHeight }}>
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
