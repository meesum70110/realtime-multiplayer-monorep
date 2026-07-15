import { css } from '@/lib/css'
import type { ViewModel } from '@rpsa/game-core'

/** The frosted glass shard barrier that divides the two halves during typing
 *  (design lines 886–904): a frost pane, static facets, an outline/crack SVG,
 *  and floating fragments, all computed in the view-model. */
export function ArenaBarrier({ vm }: { vm: ViewModel }) {
  return (
    <div style={vm.paneWrapStyle}>
      <div style={vm.paneFrostStyle}></div>
      {vm.paneFacetsStatic.map((f, i) => (
        <div key={i} style={f.style}></div>
      ))}
      <div style={vm.paneGlintClipStyle}>
        <div style={vm.paneGlintStyle}></div>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={vm.paneOverlayStyle}>
        <polygon
          points={vm.paneOutlinePts}
          fill="none"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        ></polygon>
        <polyline
          points={vm.paneCrackPts}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></polyline>
        {vm.paneLines.map((b, i) => (
          <polyline
            key={i}
            points={b.pts}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={b.style}
          ></polyline>
        ))}
      </svg>
      {vm.paneFragsStatic.map((fr, i) => (
        <div key={i} style={fr.style}></div>
      ))}
      <div
        style={css(
          'position: absolute; left: 50%; top: 545px; width: 230px; height: 26px; margin-left: -115px; border-radius: 999px; background: radial-gradient(ellipse, rgba(0,201,184,0.45), transparent 70%); filter: blur(5px);',
        )}
      ></div>
    </div>
  )
}
