import { useState } from 'react'
import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Profile settings (design lines 300–337): edit display name and country, jump to game
 *  settings, and save. The name field's focus ring is the design's `style-focus`. */
export function ProfileSettings() {
  const vm = useView()
  const [focused, setFocused] = useState(false)
  if (!vm.showProfileSettings) return null
  return (
    <div
      onClick={vm.onCloseOverlay}
      style={css(
        'position: fixed; inset: 0; z-index: 62; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(34,36,42,0.45); backdrop-filter: blur(6px); animation: overlayFade 0.25s ease both;',
      )}
    >
      <div
        onClick={vm.stopProp}
        style={css(
          'width: 100%; max-width: 410px; background: #fffdfa; border: 3px solid #22242a; border-radius: 28px; box-shadow: 8px 12px 0 rgba(34,36,42,0.18); padding: 26px 26px 22px; display: flex; flex-direction: column; gap: 15px; position: relative; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
        )}
      >
        <Pressable
          as="button"
          onClick={vm.onCloseOverlay}
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
        <div style={css('display: flex; align-items: center; gap: 11px;')}>
          <span style={css('width: 44px; height: 44px; border-radius: 13px; background: #00c9b8; display: inline-flex; align-items: center; justify-content: center; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); transform: rotate(-4deg);')}>
            <svg viewBox="0 0 24 24" style={css('width: 23px; height: 23px;')} fill="none" stroke="#06312d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M19 8v6"></path>
              <path d="M22 11h-6"></path>
            </svg>
          </span>
          <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
            <span style={css('font-size: 20px; font-weight: 900; letter-spacing: 0.02em; color: #22242a;')}>Profile Settings</span>
            <span style={css('font-size: 12px; font-weight: 700; color: #9ca3af;')}>Make the arena yours</span>
          </div>
        </div>
        <div style={css('display: flex; flex-direction: column; gap: 8px;')}>
          <span style={css('font-size: 10.5px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #b6a58c;')}>Display name</span>
          <input
            ref={vm.nameDraftRef}
            value={vm.nameDraft}
            onChange={vm.onNameDraft}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={16}
            spellCheck={false}
            placeholder="Your name"
            style={{
              ...css(
                "box-sizing: border-box; width: 100%; background: #fbf5ec; border: 2.5px solid #22242a; border-radius: 14px; outline: none; font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 800; color: #22242a; padding: 12px 16px; box-shadow: 3px 4px 0 rgba(34,36,42,0.1);",
              ),
              ...(focused ? css('box-shadow: 3px 4px 0 rgba(34,36,42,0.1), 0 0 0 3px rgba(0,201,184,0.3);') : null),
            }}
          />
        </div>
        <div style={css('display: flex; flex-direction: column; gap: 8px;')}>
          <span style={css('font-size: 10.5px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #b6a58c;')}>Country</span>
          <div style={css('display: flex; flex-wrap: wrap; gap: 7px;')}>
            {vm.countryOptions.map((co, i) => (
              <button key={i} onClick={co.pick} aria-label={co.name} style={co.selStyle}>
                {co.flag}
              </button>
            ))}
          </div>
        </div>
        <Pressable
          as="button"
          onClick={vm.onOpenGameSettings}
          baseStyle={css(
            "display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #fbf5ec; border: none; border-radius: 14px; padding: 13px 16px; font-family: 'Inter', sans-serif; cursor: pointer; transition: background 0.15s ease;",
          )}
          hoverStyle={css('background: #f2e6d3;')}
        >
          <span style={css('display: inline-flex; align-items: center; gap: 9px; font-size: 14px; font-weight: 800; color: #22242a;')}>
            <svg viewBox="0 0 24 24" style={css('width: 17px; height: 17px;')} fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Game Settings
          </span>
          <svg viewBox="0 0 24 24" style={css('width: 16px; height: 16px;')} fill="none" stroke="#9ca3af" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </Pressable>
        <Pressable
          as="button"
          onClick={vm.onSaveProfile}
          baseStyle={css(
            "width: 100%; box-sizing: border-box; background: linear-gradient(90deg, #ff6b57, #ef4f3c, #e63946); color: #fff; border: none; border-radius: 999px; padding: 14px; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 22px rgba(239,79,60,0.4); transition: transform 0.12s ease;",
          )}
          hoverStyle={css('transform: translateY(-2px);')}
          activeStyle={css('transform: scale(0.97);')}
        >
          Save Changes
        </Pressable>
      </div>
    </div>
  )
}
