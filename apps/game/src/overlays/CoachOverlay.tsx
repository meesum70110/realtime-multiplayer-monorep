import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Live tutorial coach marks (design lines 437–465): a spotlight ring that tracks the
 *  element being taught and a bubble with the step copy, progress dots, and either a
 *  next CTA or a "your turn" wait prompt. Ring/bubble positions are measured in the engine. */
export function CoachOverlay() {
  const vm = useView()
  if (!vm.coachActive) return null
  return (
    <>
      <div style={vm.coachRingStyle}></div>
      <div style={vm.coachBubbleStyle}>
        <div style={css('display: flex; align-items: center; justify-content: space-between; gap: 10px;')}>
          <span style={css('display: inline-flex; align-items: center; gap: 6px; background: rgba(87,201,79,0.12); color: #3fa03b; border-radius: 999px; padding: 4px 11px; font-size: 10px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;')}>
            🎓 Step {vm.coachNum} / {vm.coachTotal}
          </span>
          <div style={css('display: flex; gap: 5px;')}>
            {vm.coachDots.map((dot, i) => (
              <span
                key={i}
                style={{
                  width: dot.w,
                  height: '6px',
                  borderRadius: '999px',
                  background: dot.color,
                  transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                }}
              ></span>
            ))}
          </div>
        </div>
        <h4 style={css('margin: 12px 0 6px; font-size: 19px; font-weight: 900; letter-spacing: -0.01em; color: #22242a;')}>
          {vm.coachTitle}
        </h4>
        <p style={css('margin: 0; font-size: 13.5px; font-weight: 600; color: #6b7280; line-height: 1.5;')}>{vm.coachText}</p>
        <div style={css('display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px;')}>
          <Pressable
            as="button"
            onClick={vm.onCoachSkip}
            baseStyle={css(
              "background: none; border: none; color: #b6bcc4; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px;",
            )}
            hoverStyle={css('color: #e63946;')}
          >
            Skip
          </Pressable>
          {vm.coachShowCta && (
            <button onClick={vm.onCoachNext} style={vm.coachCtaStyle}>
              {vm.coachCta}
              <svg viewBox="0 0 24 24" style={css('width: 15px; height: 15px;')} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </button>
          )}
          {vm.coachShowWait && (
            <span style={css("display: inline-flex; align-items: center; gap: 7px; color: #e63946; font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 800; letter-spacing: 0.04em;")}>
              <span style={css('font-size: 15px; animation: pointBounce 1s ease-in-out infinite;')}>👆</span>
              {vm.coachWaitLabel}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
