import { useState } from 'react'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'
import type { ViewModel } from '@rpsa/game-core'

/** The "forge your throw" input row plus the error toast and idea chips
 *  (design lines 942–960). The input's focus ring is the design's `style-focus`,
 *  applied here via local focus state. */
export function ForgeInput({ vm }: { vm: ViewModel }) {
  const [focused, setFocused] = useState(false)
  return (
    <>
      <div style={vm.inputShakeStyle}>
        <input
          ref={vm.inputRef}
          data-tut="input"
          value={vm.input}
          onChange={vm.onInput}
          onKeyDown={vm.onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="type anything…"
          maxLength={18}
          spellCheck={false}
          autoComplete="off"
          style={{
            ...css(
              "flex: 1; min-width: 0; box-sizing: border-box; background: #fffdfa; border: none; border-radius: 999px; outline: none; font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; text-align: center; color: #22242a; padding: 13px 22px; border: 2.5px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.12); caret-color: #ef4f3c; transition: box-shadow 0.15s ease;",
            ),
            ...(focused
              ? css('box-shadow: 3px 4px 0 rgba(34,36,42,0.12), 0 0 0 3px rgba(0,184,169,0.35);')
              : null),
          }}
        />
        <Pressable
          as="button"
          onClick={vm.onSubmit}
          data-tut="go"
          baseStyle={css(
            "width: 56px; height: 56px; flex-shrink: 0; border-radius: 999px; background: linear-gradient(135deg, #ff6b57, #e63946); color: #fff; border: 3px solid #22242a; box-sizing: border-box; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 900; letter-spacing: 0.04em; cursor: pointer; box-shadow: 3px 4px 0 rgba(34,36,42,0.2); transition: transform 0.12s ease;",
          )}
          hoverStyle={css('transform: translateY(-2px) scale(1.06);')}
          activeStyle={css('transform: scale(0.94);')}
        >
          GO
        </Pressable>
      </div>

      {vm.hasError && (
        <span
          style={css(
            'background: rgba(230,57,70,0.12); color: #e63946; border-radius: 999px; padding: 8px 20px; font-weight: 800; font-size: 14px; animation: shakeX 0.45s ease;',
          )}
        >
          {vm.error}
        </span>
      )}

      <div
        data-tut="ideas"
        style={css(
          'display: flex; flex-direction: column; align-items: center; gap: 8px; width: 250px; margin-top: 8px; animation: riseFade 0.35s ease 0.2s both;',
        )}
      >
        <span
          style={css(
            'font-size: 11px; font-weight: 800; color: #9ca3af; letter-spacing: 0.14em; text-transform: uppercase;',
          )}
        >
          Need an idea?
        </span>
        <div style={css('display: flex; align-items: center; justify-content: center; gap: 7px; flex-wrap: wrap;')}>
          {vm.suggestions.map((s) => (
            <Pressable
              key={s.word}
              as="button"
              onClick={s.pick}
              baseStyle={css(
                "background: #fffdfa; border: 2px solid #22242a; border-radius: 999px; padding: 6px 12px; font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 800; color: #22242a; cursor: pointer; box-shadow: 2px 3px 0 rgba(34,36,42,0.12); transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;",
              )}
              hoverStyle={css('background: rgba(0,201,184,0.12); transform: translateY(-2px);')}
              activeStyle={css('transform: scale(0.92);')}
            >
              <span>{s.emoji}</span>
              <span>{s.word}</span>
            </Pressable>
          ))}
        </div>
      </div>
    </>
  )
}
