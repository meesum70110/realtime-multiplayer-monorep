import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Play with a friend (design lines 341–373): a scrollable friends list where each row
 *  opens that friend's profile or fires off an invite. */
export function InviteModal() {
  const vm = useView()
  if (!vm.showInvite) return null
  return (
    <div
      onClick={vm.onCloseOverlay}
      style={css(
        'position: fixed; inset: 0; z-index: 61; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(34,36,42,0.45); backdrop-filter: blur(6px); animation: overlayFade 0.25s ease both;',
      )}
    >
      <div
        onClick={vm.stopProp}
        style={css(
          'width: 100%; max-width: 430px; background: #fffdfa; border: 3px solid #22242a; border-radius: 28px; box-shadow: 8px 12px 0 rgba(34,36,42,0.18); padding: 26px 26px 22px; display: flex; flex-direction: column; gap: 14px; position: relative; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
        )}
      >
        <Pressable
          as="button"
          onClick={vm.onCloseOverlay}
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
        <div style={css('display: flex; align-items: center; gap: 11px;')}>
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
            <span style={css('font-size: 12px; font-weight: 700; color: #9ca3af;')}>Send an invite and settle it for real</span>
          </div>
        </div>
        <span style={css('font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #b6a58c;')}>Challenge a friend</span>
        <div style={css('display: flex; flex-direction: column; gap: 6px; max-height: 230px; overflow-y: auto;')}>
          {vm.friendsList.map((fr, i) => (
            <Pressable
              key={i}
              as="div"
              onClick={fr.onOpen}
              baseStyle={css(
                'display: flex; align-items: center; gap: 11px; background: #fbf5ec; border: 2px solid transparent; border-radius: 14px; padding: 8px 10px; cursor: pointer; transition: all 0.14s ease;',
              )}
              hoverStyle={css('background: #fffdfa; border-color: #22242a; transform: translateY(-2px); box-shadow: 3px 4px 0 rgba(34,36,42,0.12);')}
            >
              <span style={fr.avatarStyle}>{fr.initial}</span>
              <div style={css('flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;')}>
                <span style={css('font-size: 13.5px; font-weight: 900; color: #22242a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;')}>
                  {fr.name}
                </span>
                <span style={css('display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #9ca3af;')}>
                  <span style={fr.dotStyle}></span>
                  {fr.country} · {fr.statusLabel}
                </span>
              </div>
              {fr.invited && (
                <span style={css('display: inline-flex; align-items: center; gap: 5px; background: rgba(87,201,79,0.16); color: #3fa03b; border-radius: 999px; padding: 7px 14px; font-size: 12px; font-weight: 900; letter-spacing: 0.02em;')}>
                  ✓ Invited
                </span>
              )}
              {fr.notInvited && (
                <Pressable
                  as="button"
                  onClick={fr.onInvite}
                  baseStyle={css(
                    "flex-shrink: 0; background: #22242a; color: #fffdfa; border: none; border-radius: 999px; padding: 8px 17px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 0.04em; cursor: pointer; transition: transform 0.12s ease;",
                  )}
                  hoverStyle={css('transform: translateY(-1px);')}
                  activeStyle={css('transform: scale(0.94);')}
                >
                  Invite
                </Pressable>
              )}
            </Pressable>
          ))}
        </div>
      </div>
    </div>
  )
}
