import { css } from '@/lib/css'
import { MorphIcon } from '@/components/MorphIcon'
import { useIsWideDesktop } from '@/lib/useBreakpoint'
import type { ViewModel } from '@rpsa/game-core'

/** Menu logo: four tilted battle cards (rock / paper / scissors / morphing "anything"),
 *  the title, and the tagline (design lines 620–653). */
export function MenuLogo({ vm }: { vm: ViewModel }) {
  const isWideDesktop = useIsWideDesktop()
  const card = isWideDesktop ? '72px' : 'clamp(56px, 14vw, 72px)'
  return (
    <div
      style={css(
        isWideDesktop
          ? 'display: flex; flex-direction: column; align-items: center; gap: 16px; animation: riseFade 0.45s ease 0.06s both, menuFloat 3.4s ease-in-out 0.6s infinite;'
          : 'display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 3vw, 18px); animation: riseFade 0.45s ease 0.06s both, menuFloat 3.4s ease-in-out 0.6s infinite; width: 100%;',
      )}
    >
      <div style={css('display: flex; align-items: center; justify-content: center;')} aria-hidden="true">
        <div
          style={css(
            `width: ${card}; height: ${card}; border-radius: clamp(16px, 4vw, 20px); background: #ff4d6d; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(-13deg) translateY(6px); position: relative; z-index: 4; margin-left: -8px;`,
          )}
        >
          <svg viewBox="0 0 48 48" style={css('width: 70%; height: 70%;')}>
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
            `width: ${card}; height: ${card}; border-radius: clamp(16px, 4vw, 20px); background: #ffd233; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(-5deg) translateY(-9px); position: relative; z-index: 3; margin-left: -10px;`,
          )}
        >
          <svg viewBox="0 0 48 48" style={css('width: 70%; height: 70%;')}>
            <rect x="10" y="8" width="28" height="34" rx="3" fill="#fff" stroke="#1a1a1a" strokeWidth="2"></rect>
            <line x1="15" y1="16" x2="33" y2="16" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
            <line x1="15" y1="22" x2="33" y2="22" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
            <line x1="15" y1="28" x2="28" y2="28" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
          </svg>
        </div>
        <div
          style={css(
            `width: ${card}; height: ${card}; border-radius: clamp(16px, 4vw, 20px); background: #00c9b8; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(5deg) translateY(-9px); position: relative; z-index: 2; margin-left: -10px;`,
          )}
        >
          <svg
            viewBox="0 0 24 24"
            style={css('width: 62%; height: 62%;')}
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
            `width: ${card}; height: ${card}; border-radius: clamp(16px, 4vw, 20px); background: #fffdfa; border: 3.5px solid #22242a; box-shadow: 4px 8px 0 rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transform: rotate(13deg) translateY(6px); position: relative; z-index: 1; margin-left: -10px; overflow: hidden;`,
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
            'font-size: clamp(28px, 7vw, 38px); font-weight: 900; letter-spacing: -0.02em; color: #000000; line-height: 1.0; text-align: center;',
          )}
        >
          Rock Paper Scissors
        </span>
        <span
          style={css(
            'font-size: clamp(40px, 10vw, 56px); font-weight: 900; letter-spacing: -0.02em; color: #ff6b57; line-height: 0.95;',
          )}
        >
          Anything
        </span>
      </h1>
      <span
        style={css(
          isWideDesktop
            ? 'background: #22242a; color: #fffdfa; border-radius: 999px; padding: clamp(7px, 0.7vw, 9px) clamp(22px, 2.4vw, 34px); font-size: clamp(12px, 1.05vw, 13.5px); font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; text-align: center; white-space: nowrap; line-height: 1.2; box-sizing: border-box;'
            : 'background: #22242a; color: #fffdfa; border-radius: 999px; padding: clamp(7px, 2vw, 10px) clamp(16px, 4vw, 28px); font-size: clamp(11px, 2.8vw, 13px); font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2px; line-height: 1.25; max-width: min(100%, 380px); box-sizing: border-box;',
        )}
      >
        {isWideDesktop ? (
          'Outplay · Outtype · Outlast — Best of 3'
        ) : (
          <>
            <span style={css('display: block; text-align: center;')}>Outplay · Outtype · Outlast</span>
            <span style={css('display: block; text-align: center;')}>— Best of 3</span>
          </>
        )}
      </span>
    </div>
  )
}
