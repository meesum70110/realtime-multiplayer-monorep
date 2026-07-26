import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Play with a Friend: create a private room code or join with a friend's code. */
export function InviteModal() {
  const vm = useView()
  if (!vm.showInvite) return null
  return (
    <div
      onClick={() => {
        if (vm.privateIsHosting) vm.onCancelPrivateLobby()
        vm.onCloseOverlay()
      }}
      style={css(
        'position: fixed; inset: 0; z-index: 61; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(34,36,42,0.45); backdrop-filter: blur(6px); animation: overlayFade 0.25s ease both;',
      )}
    >
      <div
        onClick={vm.stopProp}
        style={css(
          'width: 100%; max-width: 430px; background: #fffdfa; border: 3px solid #22242a; border-radius: 28px; box-shadow: 8px 12px 0 rgba(34,36,42,0.18); padding: 26px 26px 22px; display: flex; flex-direction: column; gap: 16px; position: relative; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
        )}
      >
        <Pressable
          as="button"
          onClick={() => {
            if (vm.privateIsHosting) vm.onCancelPrivateLobby()
            vm.onCloseOverlay()
          }}
          aria-label="Close"
          baseStyle={css(
            'position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 999px; background: #fbf1e4; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; z-index: 2;',
          )}
          hoverStyle={css('background: rgba(230,57,70,0.12);')}
        >
          <svg viewBox="0 0 24 24" style={css('width: 16px; height: 16px;')} fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </Pressable>

        <div style={css('display: flex; align-items: center; gap: 11px; padding-right: 36px;')}>
          <span style={css('width: 44px; height: 44px; border-radius: 13px; background: #ff4d6d; display: inline-flex; align-items: center; justify-content: center; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); transform: rotate(-4deg);')}>
            <svg viewBox="0 0 24 24" style={css('width: 24px; height: 24px;')} fill="none" stroke="#fffdfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
            <span style={css('font-size: 20px; font-weight: 900; letter-spacing: 0.02em; color: #22242a;')}>Play with a Friend</span>
            <span style={css('font-size: 12px; font-weight: 700; color: #9ca3af;')}>Private room — share a code, skip the queue</span>
          </div>
        </div>

        {vm.privateIsHosting ? (
          <div style={css('display: flex; flex-direction: column; gap: 12px; background: #fbf5ec; border: 2px solid #22242a; border-radius: 18px; padding: 18px 16px;')}>
            <span style={css('font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #b6a58c; text-align: center;')}>
              Your room code
            </span>
            <span style={css('font-size: 36px; font-weight: 900; letter-spacing: 0.28em; text-align: center; color: #22242a; font-variant-numeric: tabular-nums;')}>
              {vm.privateInviteCode}
            </span>
            <span style={css('font-size: 13px; font-weight: 700; color: #6b7280; text-align: center;')}>
              Waiting for your friend to join…
            </span>
            <div style={css('display: flex; gap: 10px;')}>
              <Pressable
                as="button"
                onClick={vm.onCopyPrivateCode}
                baseStyle={css(
                  "flex: 1; background: #22242a; color: #fffdfa; border: none; border-radius: 999px; padding: 12px 16px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer;",
                )}
                hoverStyle={css('transform: translateY(-1px);')}
              >
                Copy code
              </Pressable>
              <Pressable
                as="button"
                onClick={vm.onCancelPrivateLobby}
                baseStyle={css(
                  "flex: 1; background: #fffdfa; color: #22242a; border: 2px solid #22242a; border-radius: 999px; padding: 12px 16px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer;",
                )}
              >
                Cancel room
              </Pressable>
            </div>
          </div>
        ) : (
          <>
            <div style={css('display: flex; flex-direction: column; gap: 10px;')}>
              <span style={css('font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #b6a58c;')}>
                Create private room
              </span>
              <Pressable
                as="button"
                onClick={vm.onCreatePrivateLobby}
                baseStyle={css(
                  "background: linear-gradient(90deg, #ff6b57, #e63946); color: #fff; border: none; border-radius: 999px; padding: 14px 20px; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; box-shadow: 0 6px 18px rgba(230,57,70,0.35);",
                )}
                hoverStyle={css('transform: translateY(-2px);')}
                activeStyle={css('transform: scale(0.98);')}
              >
                Create Private Room
              </Pressable>
            </div>

            <div style={css('height: 1px; background: #f0e2cd;')} />

            <div style={css('display: flex; flex-direction: column; gap: 10px;')}>
              <span style={css('font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #b6a58c;')}>
                Join private room
              </span>
              <div style={css('display: flex; gap: 8px;')}>
                <input
                  value={vm.privateJoinDraft}
                  onChange={vm.onPrivateJoinDraft}
                  placeholder="ABC123"
                  maxLength={6}
                  spellCheck={false}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: '2px solid #22242a',
                    borderRadius: 14,
                    padding: '12px 14px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#22242a',
                    background: '#fbf5ec',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Pressable
                  as="button"
                  onClick={vm.onJoinPrivateLobby}
                  baseStyle={css(
                    "flex-shrink: 0; background: #22242a; color: #fffdfa; border: none; border-radius: 999px; padding: 12px 20px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer;",
                  )}
                  hoverStyle={css('transform: translateY(-1px);')}
                >
                  Join
                </Pressable>
              </div>
            </div>
          </>
        )}

        {!!vm.privateError && (
          <span
            style={css(
              vm.privateError === 'Code copied!'
                ? 'font-size: 13px; font-weight: 800; color: #3fa03b; text-align: center;'
                : 'font-size: 13px; font-weight: 800; color: #e63946; text-align: center;',
            )}
          >
            {vm.privateError}
          </span>
        )}
      </div>
    </div>
  )
}
