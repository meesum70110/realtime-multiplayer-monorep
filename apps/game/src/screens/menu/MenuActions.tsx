import type { ReactNode } from 'react'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'
import { useIsWideDesktop } from '@/lib/useBreakpoint'
import type { ViewModel } from '@rpsa/game-core'

/** Primary CTA (Find Match) + "Play with a Friend", and the bottom nav pill
 *  (How to Play / Tutorial / Settings) — design lines 655–687.
 *  Mid/phone widths use clamp() so CTAs grow with the viewport; wide desktop keeps the row pill. */
export function MenuActions({ vm }: { vm: ViewModel }) {
  const isWideDesktop = useIsWideDesktop()

  const navBtn = (opts: {
    onClick: () => void
    label: string
    bg: string
    stroke: string
    path: ReactNode
  }) => (
    <Pressable
      as="button"
      onClick={opts.onClick}
      baseStyle={css(
        isWideDesktop
          ? "display: flex; align-items: center; gap: 9px; background: transparent; border: none; border-radius: 999px; padding: 8px 15px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: #22242a; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.15s ease;"
          : "display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(5px, 1.2vw, 8px); background: transparent; border: none; border-radius: 16px; padding: clamp(6px, 1.5vw, 10px) 4px; font-family: 'Inter', sans-serif; font-size: clamp(10px, 2.6vw, 13px); font-weight: 700; color: #22242a; cursor: pointer; width: 100%; min-width: 0; box-sizing: border-box; transition: background 0.15s ease;",
      )}
      hoverStyle={css('background: #fbf1e4;')}
    >
      <span
        style={css(
          isWideDesktop
            ? `width: 34px; height: 34px; border-radius: 999px; background: ${opts.bg}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;`
            : `width: clamp(30px, 7vw, 36px); height: clamp(30px, 7vw, 36px); border-radius: 999px; background: ${opts.bg}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;`,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          style={css(
            isWideDesktop
              ? 'width: 18px; height: 18px;'
              : 'width: clamp(15px, 4vw, 18px); height: clamp(15px, 4vw, 18px);',
          )}
          fill="none"
          stroke={opts.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {opts.path}
        </svg>
      </span>
      <span style={css(isWideDesktop ? '' : 'text-align: center; line-height: 1.15;')}>{opts.label}</span>
    </Pressable>
  )

  return (
    <>
      <div
        style={css(
          isWideDesktop
            ? 'display: flex; flex-direction: column; align-items: stretch; gap: 14px; width: 100%; max-width: 460px; animation: riseFade 0.45s ease 0.14s both;'
            : 'display: flex; flex-direction: column; align-items: stretch; gap: clamp(10px, 2.5vw, 16px); width: 100%; max-width: min(100%, 480px); animation: riseFade 0.45s ease 0.14s both;',
        )}
      >
        <Pressable
          as="button"
          onClick={vm.onFindMatch}
          baseStyle={css(
            isWideDesktop
              ? "display: flex; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(90deg, #ff6b57, #ef4f3c, #e63946); color: #fff; border: none; border-radius: 999px; padding: 20px 40px; font-family: 'Inter', sans-serif; font-size: 23px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 22px rgba(239,79,60,0.4); transition: transform 0.12s ease; animation: ctaPulse 2.2s ease-in-out infinite;"
              : "display: flex; align-items: center; justify-content: center; gap: clamp(8px, 2vw, 12px); background: linear-gradient(90deg, #ff6b57, #ef4f3c, #e63946); color: #fff; border: none; border-radius: 999px; padding: clamp(14px, 4vw, 22px) clamp(20px, 6vw, 40px); font-family: 'Inter', sans-serif; font-size: clamp(16px, 5vw, 23px); font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 22px rgba(239,79,60,0.4); transition: transform 0.12s ease; animation: ctaPulse 2.2s ease-in-out infinite;",
          )}
          hoverStyle={css('transform: translateY(-3px) scale(1.02);')}
          activeStyle={css('transform: scale(0.97);')}
        >
          <svg
            viewBox="0 0 24 24"
            style={css(
              isWideDesktop
                ? 'width: 26px; height: 26px;'
                : 'width: clamp(20px, 5vw, 26px); height: clamp(20px, 5vw, 26px);',
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
          </svg>
          Find Match
        </Pressable>
        <Pressable
          as="button"
          onClick={vm.onOpenInvite}
          baseStyle={css(
            isWideDesktop
              ? "display: flex; align-items: center; justify-content: center; gap: 10px; background: #fffdfa; color: #22242a; border: 3px solid #22242a; border-radius: 999px; padding: 14px 32px; font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; box-shadow: 4px 5px 0 rgba(34,36,42,0.14); transition: transform 0.12s ease;"
              : "display: flex; align-items: center; justify-content: center; gap: clamp(8px, 2vw, 10px); background: #fffdfa; color: #22242a; border: 3px solid #22242a; border-radius: 999px; padding: clamp(11px, 3vw, 16px) clamp(18px, 5vw, 32px); font-family: 'Inter', sans-serif; font-size: clamp(13px, 3.6vw, 16px); font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; box-shadow: 4px 5px 0 rgba(34,36,42,0.14); transition: transform 0.12s ease;",
          )}
          hoverStyle={css('transform: translateY(-2px);')}
          activeStyle={css('transform: scale(0.97);')}
        >
          <span
            style={css(
              isWideDesktop
                ? 'width: 26px; height: 26px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;'
                : 'width: clamp(20px, 5vw, 26px); height: clamp(20px, 5vw, 26px); flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              style={css('width: 100%; height: 100%;')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          Play with a Friend
        </Pressable>
      </div>

      <div
        style={css(
          isWideDesktop
            ? 'background: #fffdfa; border-radius: 999px; padding: 8px 12px; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.08); display: flex; align-items: center; gap: 8px; animation: riseFade 0.45s ease 0.22s both;'
            : 'background: #fffdfa; border-radius: clamp(16px, 4vw, 22px); padding: clamp(6px, 1.5vw, 10px) clamp(4px, 1.5vw, 8px); box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.08); display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; width: 100%; max-width: min(100%, 480px); box-sizing: border-box; animation: riseFade 0.45s ease 0.22s both;',
        )}
      >
        {navBtn({
          onClick: vm.onHowToPlay,
          label: 'How to Play',
          bg: '#4c8dff',
          stroke: '#fff',
          path: (
            <>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <path d="M12 17h.01"></path>
            </>
          ),
        })}
        {navBtn({
          onClick: vm.onTutorial,
          label: 'Tutorial',
          bg: '#57c94f',
          stroke: '#fff',
          path: <polygon points="6 3 20 12 6 21 6 3"></polygon>,
        })}
        {navBtn({
          onClick: vm.onOpenSettings,
          label: 'Settings',
          bg: '#00c9b8',
          stroke: '#06312d',
          path: (
            <>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </>
          ),
        })}
      </div>
    </>
  )
}
