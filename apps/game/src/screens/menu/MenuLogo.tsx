import { css } from '@/lib/css'
import { MorphIcon } from '@/components/MorphIcon'
import type { ViewModel } from '@rpsa/game-core'

/** Menu logo: four tilted battle cards (rock / paper / scissors / morphing "anything"),
 *  the title, and the tagline (design lines 620–653). The fourth card's fill, spark, and
 *  glyph replace the design's `menuCardFill` / `menuCardSpark` / `menuMorphEl` bindings —
 *  driven by the plain `morphColor` / `morphInk` / `morphSym` view-model data. */
export function MenuLogo({ vm }: { vm: ViewModel }) {
  return (
    <div
      style={css(
        'display: flex; flex-direction: column; align-items: center; gap: 16px; animation: riseFade 0.45s ease 0.06s both, menuFloat 3.4s ease-in-out 0.6s infinite;',
      )}
    >
      <div style={css('display: flex; align-items: center; justify-content: center;')} aria-hidden="true">
        <div
          style={css(
            'width: 72px; height: 72px; border-radius: 20px; background: #ff4d6d; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(-13deg) translateY(6px); position: relative; z-index: 4; margin-left: -8px;',
          )}
        >
          <svg viewBox="0 0 48 48" style={css('width: 40px; height: 40px;')}>
            <path
              d="M10 30 C8 24 12 16 20 14 C24 10 32 12 36 18 C40 24 38 32 30 36 C22 40 12 38 10 30 Z"
              fill="#1a1a1a"
            ></path>
            <path
              d="M18 22 C19 20 22 19 24 21 C26 19 29 20 30 22 C31 24 29 27 26 27 C23 27 17 25 18 22 Z"
              fill="#333"
              opacity="0.5"
            ></path>
          </svg>
        </div>
        <div
          style={css(
            'width: 72px; height: 72px; border-radius: 20px; background: #ffd233; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(-5deg) translateY(-9px); position: relative; z-index: 3; margin-left: -10px;',
          )}
        >
          <svg viewBox="0 0 48 48" style={css('width: 40px; height: 40px;')}>
            <rect x="10" y="8" width="28" height="34" rx="3" fill="#fff" stroke="#1a1a1a" strokeWidth="2"></rect>
            <line x1="15" y1="16" x2="33" y2="16" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
            <line x1="15" y1="22" x2="33" y2="22" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
            <line x1="15" y1="28" x2="28" y2="28" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
          </svg>
        </div>
        <div
          style={css(
            'width: 72px; height: 72px; border-radius: 20px; background: #00c9b8; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(5deg) translateY(-9px); position: relative; z-index: 2; margin-left: -10px;',
          )}
        >
          <svg
            viewBox="0 0 24 24"
            style={css('width: 36px; height: 36px;')}
            fill="none"
            stroke="#22242a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="3"></circle>
            <path d="M8.12 8.12 12 12"></path>
            <path d="M20 4 8.12 15.88"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <path d="M14.8 14.8 20 20"></path>
          </svg>
        </div>
        <div
          style={css(
            'width: 72px; height: 72px; border-radius: 20px; background: #fffdfa; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(13deg) translateY(6px); position: relative; z-index: 1; margin-left: -10px; overflow: hidden;',
          )}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0px',
              borderRadius: '16px',
              backgroundColor: vm.morphColor,
              transition: 'background-color 0.55s ease',
              zIndex: 0,
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '10px',
              top: '8px',
              color: vm.morphInk,
              fontSize: '12px',
              zIndex: 2,
              opacity: 0.7,
              transition: 'color 0.55s ease',
            }}
          >
            ✦
          </span>
          <span
            key={vm.morphK}
            style={css(
              'position: relative; z-index: 2; display: inline-flex; align-items: center; justify-content: center; animation: menuMorphIn 0.55s cubic-bezier(.34,1.56,.64,1) both;',
            )}
          >
            <MorphIcon sym={vm.morphSym} ink={vm.morphInk} />
          </span>
        </div>
      </div>
      <h1 style={css('margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0; max-width: 100%;')}>
        <span
          style={css(
            'font-size: clamp(31px, 3.2vw, 38px); font-weight: 900; letter-spacing: -0.02em; color: #000000; line-height: 1.0; text-align: center;',
          )}
        >
          Rock Paper Scissors
        </span>
        <span
          style={css(
            'font-size: clamp(46px, 4.8vw, 56px); font-weight: 900; letter-spacing: -0.02em; color: #ff6b57; line-height: 0.95;',
          )}
        >
          Anything
        </span>
      </h1>
      <span
        style={css(
          "background: #22242a; color: #fffdfa; border-radius: 999px; padding: 7px 22px; font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;",
        )}
      >
        Outplay · Outtype · Outlast — Best of 3
      </span>
    </div>
  )
}
