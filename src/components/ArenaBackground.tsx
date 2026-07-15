import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'

/** Three stacked background layers (design lines 112–121). The menu/arena layers
 *  cross-fade via computed style objects from the view-model; the third radial
 *  wash is a static literal copied verbatim. */
export function ArenaBackground() {
  const vm = useView()
  return (
    <div style={css('position: absolute; inset: 0; pointer-events: none; overflow: hidden;')}>
      <div style={vm.bgMenuStyle}></div>
      <div style={vm.bgArenaStyle}></div>
      <div
        style={css(
          'position: absolute; inset: 0; background: radial-gradient(ellipse 56% 46% at 50% 44%, rgba(253,243,229,0.4) 0%, rgba(253,243,229,0.14) 55%, rgba(253,243,229,0) 100%);',
        )}
      ></div>
    </div>
  )
}
