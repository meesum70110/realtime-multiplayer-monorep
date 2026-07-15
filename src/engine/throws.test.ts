import { describe, it, expect } from 'vitest'
import { emojiFor, resolveClash, validate } from './weapons'

describe('emojiFor', () => {
  it('maps a known keyword', () => {
    expect(emojiFor('Volcano')).toBe('🌋')
  })
  it('returns a fallback glyph for unknown words', () => {
    expect(typeof emojiFor('zxqwerty')).toBe('string')
    expect(emojiFor('zxqwerty').length).toBeGreaterThan(0)
  })
})

describe('validate', () => {
  it('rejects empty', () => {
    expect(validate('   ').ok).toBe(false)
  })
  it('accepts a normal weapon', () => {
    expect(validate('Angry Goose')).toEqual({ ok: true, word: 'Angry Goose' })
  })
})

describe('resolveClash', () => {
  it('is deterministic-shaped', () => {
    const r = resolveClash('Lava', 'Paper')
    expect(['you', 'opp', 'tie']).toContain(r.outcome)
    expect(typeof r.headline).toBe('string')
  })
})
