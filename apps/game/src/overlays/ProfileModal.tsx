import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Profile modal (design lines 187–252): shows you / the bot / a friend, with avatar,
 *  tag, country, a stat grid, an optional notice, and context actions (add friend,
 *  share/settings for yourself, report/block for others). */
export function ProfileModal() {
  const vm = useView()
  if (!vm.showProfile) return null
  return (
    <div
      onClick={vm.onCloseProfile}
      style={css(
        'position: fixed; inset: 0; z-index: 62; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(34,36,42,0.45); backdrop-filter: blur(6px); animation: overlayFade 0.25s ease both;',
      )}
    >
      <div
        onClick={vm.stopProp}
        style={css(
          'width: 100%; max-width: 400px; background: #fffdfa; border: 3px solid #22242a; border-radius: 28px; box-shadow: 8px 12px 0 rgba(34,36,42,0.18); padding: 28px 26px 22px; display: flex; flex-direction: column; align-items: center; gap: 12px; position: relative; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
        )}
      >
        <Pressable
          as="button"
          onClick={vm.onCloseProfile}
          aria-label="Close"
          baseStyle={css(
            'position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 999px; background: #fbf1e4; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;',
          )}
          hoverStyle={css('background: rgba(230,57,70,0.12);')}
        >
          <svg viewBox="0 0 24 24" style={css('width: 16px; height: 16px;')} fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </Pressable>
        <span style={vm.profileRingStyle}>
          {vm.profileIsYou && (
            <svg viewBox="0 0 64 64" style={css('width: 60px; height: 60px;')} aria-label="Your avatar">
              <defs>
                <linearGradient id="skinP" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5eead4"></stop>
                  <stop offset="100%" stopColor="#14b8a6"></stop>
                </linearGradient>
              </defs>
              <line x1="22" y1="14" x2="18" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
              <line x1="42" y1="14" x2="46" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
              <circle cx="18" cy="4" r="3" fill="#f472b6"></circle>
              <circle cx="46" cy="4" r="3" fill="#f472b6"></circle>
              <ellipse cx="32" cy="34" rx="22" ry="24" fill="url(#skinP)"></ellipse>
              <ellipse cx="24" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
              <ellipse cx="40" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
              <circle cx="25" cy="33" r="4" fill="#1e293b"></circle>
              <circle cx="41" cy="33" r="4" fill="#1e293b"></circle>
              <path d="M 24 44 Q 32 50 40 44" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
          )}
          {vm.profileIsBot && (
            <svg viewBox="0 0 24 24" style={css('width: 52px; height: 52px;')} fill="none" stroke="#22242a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Bot avatar">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          )}
          {vm.profileIsFriend && <span style={css('font-size: 46px; line-height: 1;')}>{vm.profileFlag}</span>}
        </span>
        <div style={css('display: flex; flex-direction: column; align-items: center; gap: 3px;')}>
          <span style={css('font-size: 22px; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; color: #22242a;')}>
            {vm.profileName}
          </span>
          <span style={css('font-size: 13px; font-weight: 700; color: #9ca3af;')}>{vm.profileHandle}</span>
        </div>
        <div style={css('display: flex; align-items: center; gap: 8px;')}>
          <span style={vm.profileTagStyle}>{vm.profileTag}</span>
          <span style={css('display: inline-flex; align-items: center; gap: 6px; background: #fbf5ec; border-radius: 999px; padding: 5px 12px; font-size: 12px; font-weight: 800; color: #6b7280;')}>
            <span style={css('font-size: 16px;')}>{vm.profileFlag}</span>
            {vm.profileCountry}
          </span>
        </div>
        <div style={css('display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; margin-top: 4px;')}>
          {vm.profileStats.map((st, i) => (
            <div key={i} style={css('background: #fbf5ec; border-radius: 14px; padding: 10px 13px; display: flex; flex-direction: column; gap: 2px;')}>
              <span style={css('font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #b6a58c;')}>{st.label}</span>
              <span style={css('font-size: 15px; font-weight: 900; color: #22242a;')}>{st.value}</span>
            </div>
          ))}
        </div>
        {vm.profileHasNotice && (
          <div style={css('width: 100%; box-sizing: border-box; background: rgba(0,201,184,0.1); border-radius: 12px; padding: 9px 13px; font-size: 12.5px; font-weight: 700; color: #00857a; text-align: center; animation: riseFade 0.3s ease both;')}>
            {vm.profileNotice}
          </div>
        )}
        <div style={css('display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;')}>
          {vm.profileNotYou && (
            <Pressable
              as="button"
              onClick={vm.onProfileFriend}
              baseStyle={css(
                "width: 100%; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(90deg, #4fb84a, #3fa03b); color: #fff; border: none; border-radius: 999px; padding: 13px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 20px rgba(87,201,79,0.4); transition: transform 0.12s ease;",
              )}
              hoverStyle={css('transform: translateY(-2px);')}
              activeStyle={css('transform: scale(0.97);')}
            >
              <svg viewBox="0 0 24 24" style={css('width: 17px; height: 17px;')} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
              Add Friend
            </Pressable>
          )}
          {vm.profileIsYou && (
            <div style={css('display: flex; gap: 8px; width: 100%;')}>
              <Pressable
                as="button"
                onClick={vm.onProfileShare}
                baseStyle={css(
                  "flex: 1; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 7px; background: #22242a; color: #fffdfa; border: none; border-radius: 999px; padding: 13px; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 900; letter-spacing: 0.03em; text-transform: uppercase; cursor: pointer; box-shadow: 4px 5px 0 rgba(34,36,42,0.16); transition: transform 0.12s ease;",
                )}
                hoverStyle={css('transform: translateY(-2px);')}
                activeStyle={css('transform: scale(0.97);')}
              >
                <svg viewBox="0 0 24 24" style={css('width: 16px; height: 16px;')} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line>
                  <line x1="15.4" y1="6.5" x2="8.6" y2="10.5"></line>
                </svg>
                Share
              </Pressable>
              <Pressable
                as="button"
                onClick={vm.onProfileSettings}
                baseStyle={css(
                  "flex: 1; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 7px; background: #fbf1e4; color: #22242a; border: none; border-radius: 999px; padding: 13px; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 900; letter-spacing: 0.03em; text-transform: uppercase; cursor: pointer; transition: all 0.15s ease;",
                )}
                hoverStyle={css('background: #f2e6d3; transform: translateY(-2px);')}
                activeStyle={css('transform: scale(0.97);')}
              >
                <svg viewBox="0 0 24 24" style={css('width: 16px; height: 16px;')} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Settings
              </Pressable>
            </div>
          )}
          {vm.profileNotYou && (
            <div style={css('display: flex; gap: 8px; width: 100%;')}>
              <Pressable
                as="button"
                onClick={vm.onProfileReport}
                baseStyle={css(
                  "flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #fbf1e4; color: #6b7280; border: none; border-radius: 999px; padding: 11px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.15s ease;",
                )}
                hoverStyle={css('background: rgba(230,57,70,0.12); color: #e63946;')}
              >
                <svg viewBox="0 0 24 24" style={css('width: 15px; height: 15px;')} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                Report
              </Pressable>
              <Pressable
                as="button"
                onClick={vm.onProfileBlock}
                baseStyle={css(
                  "flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #fbf1e4; color: #6b7280; border: none; border-radius: 999px; padding: 11px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.15s ease;",
                )}
                hoverStyle={css('background: rgba(230,57,70,0.12); color: #e63946;')}
              >
                <svg viewBox="0 0 24 24" style={css('width: 15px; height: 15px;')} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.9" y1="4.9" x2="19.1" y2="19.1"></line>
                </svg>
                Block
              </Pressable>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
