import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Match chat (design lines 135–185): a fixed FAB with an unread badge, a bot-reply toast,
 *  and an expandable panel with the message list and quick-emote buttons. */
export function ChatWidget() {
  const vm = useView()
  if (!vm.showChat) return null
  return (
    <div style={css('position: fixed; right: 22px; bottom: 22px; z-index: 56; display: flex; flex-direction: column; align-items: flex-end; gap: 12px;')}>
      {vm.chatOpen && (
        <div
          style={css(
            'width: 322px; height: 400px; background: #fffdfa; border: 3px solid #22242a; border-radius: 22px; box-shadow: 6px 9px 0 rgba(34,36,42,0.16); display: flex; flex-direction: column; overflow: hidden; animation: modalPop 0.3s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
          )}
        >
          <div style={css('display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; background: #22242a; flex-shrink: 0;')}>
            <div style={css('display: flex; align-items: center; gap: 9px;')}>
              <span style={css('width: 30px; height: 30px; border-radius: 9px; background: rgba(255,138,110,0.18); display: inline-flex; align-items: center; justify-content: center;')}>
                <svg viewBox="0 0 24 24" style={css('width: 17px; height: 17px;')} fill="none" stroke="#ff8a6e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"></path>
                </svg>
              </span>
              <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
                <span style={css('font-size: 13px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #fffdfa; line-height: 1;')}>
                  Match Chat
                </span>
                <span style={css('display: inline-flex; align-items: center; gap: 5px; font-size: 9.5px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #9ca3af; line-height: 1;')}>
                  <span style={css('width: 6px; height: 6px; border-radius: 999px; background: #57c94f; animation: pulseDot 1.8s ease-out infinite;')}></span>
                  DOOM_BOT online
                </span>
              </div>
            </div>
            <Pressable
              as="button"
              onClick={vm.onToggleChat}
              aria-label="Collapse chat"
              baseStyle={css(
                'width: 30px; height: 30px; border-radius: 999px; background: rgba(255,255,255,0.1); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s ease;',
              )}
              hoverStyle={css('background: rgba(255,255,255,0.22);')}
            >
              <svg viewBox="0 0 24 24" style={css('width: 15px; height: 15px;')} fill="none" stroke="#fffdfa" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </Pressable>
          </div>
          <div
            ref={vm.chatScrollRef}
            style={css('flex: 1; overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 8px; background: #fbf5ec;')}
          >
            {vm.chatEmpty && (
              <div style={css('margin: auto; text-align: center; color: #b6a58c; font-size: 12.5px; font-weight: 700; line-height: 1.6;')}>
                Trash-talk your rival 👇
                <br />
                Tap a quick emote to fire it off.
              </div>
            )}
            {vm.chatList.map((m, i) => (
              <div key={i} style={m.rowStyle}>
                <span style={m.bubbleStyle}>{m.text}</span>
              </div>
            ))}
          </div>
          <div style={css('padding: 9px; border-top: 2px solid #f0e2cd; display: flex; flex-wrap: wrap; gap: 6px; background: #fffdfa; flex-shrink: 0;')}>
            {vm.quickChats.map((q, i) => (
              <Pressable
                key={i}
                as="button"
                onClick={q.send}
                baseStyle={css(
                  "display: inline-flex; align-items: center; gap: 5px; background: #fbf1e4; border: 2px solid #22242a; border-radius: 999px; padding: 6px 11px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 800; color: #22242a; cursor: pointer; box-shadow: 1.5px 2px 0 rgba(34,36,42,0.12); transition: all 0.12s ease;",
                )}
                hoverStyle={css('background: rgba(0,201,184,0.14); transform: translateY(-1px);')}
                activeStyle={css('transform: scale(0.94);')}
              >
                <span style={css('font-size: 14px; line-height: 1;')}>{q.emoji}</span>
                {q.text}
              </Pressable>
            ))}
          </div>
        </div>
      )}
      {vm.chatShowToast && (
        <Pressable
          as="button"
          onClick={vm.onToggleChat}
          baseStyle={css(
            'max-width: 252px; display: flex; align-items: center; gap: 9px; background: #2b2e37; border: none; border-radius: 16px 16px 4px 16px; padding: 10px 13px; box-shadow: 4px 6px 0 rgba(34,36,42,0.18); cursor: pointer; text-align: left; animation: toastIn 0.35s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
          )}
        >
          <span style={css('width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; background: rgba(255,138,110,0.2); display: inline-flex; align-items: center; justify-content: center; font-size: 15px;')}>
            🤖
          </span>
          <span style={css('display: flex; flex-direction: column; gap: 2px; min-width: 0;')}>
            <span style={css('font-size: 9.5px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #ff8a6e; line-height: 1;')}>
              DOOM_BOT
            </span>
            <span style={css('font-size: 12.5px; font-weight: 700; color: #fffdfa; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;')}>
              {vm.chatToast}
            </span>
          </span>
        </Pressable>
      )}
      <Pressable as="button" onClick={vm.onToggleChat} aria-label="Match chat" baseStyle={vm.chatFabStyle} hoverStyle={css('transform: translateY(-2px) scale(1.04);')} activeStyle={css('transform: scale(0.95);')}>
        <svg viewBox="0 0 24 24" style={css('width: 26px; height: 26px;')} fill="none" stroke="#fffdfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"></path>
        </svg>
        {vm.chatHasUnread && (
          <span
            style={css(
              'position: absolute; top: -7px; right: -7px; min-width: 22px; height: 22px; box-sizing: border-box; padding: 0 5px; border-radius: 999px; background: #ff4d6d; border: 2.5px solid #fdf3e5; color: #fff; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center; animation: popIn 0.35s ease both;',
            )}
          >
            {vm.chatUnread}
          </span>
        )}
      </Pressable>
    </div>
  )
}
