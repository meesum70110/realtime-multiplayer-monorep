import { describe, it, expect } from 'vitest'
import { css } from './css'

describe('css', () => {
  it('camelCases kebab props', () => {
    expect(css('background-color: red; z-index: 5')).toEqual({ backgroundColor: 'red', zIndex: '5' })
  })
  it('preserves vendor prefixes as Webkit*', () => {
    expect(css('-webkit-backface-visibility: hidden')).toEqual({ WebkitBackfaceVisibility: 'hidden' })
  })
  it('keeps CSS custom properties verbatim', () => {
    expect(css('--tx: 40px; color: #fff')).toEqual({ '--tx': '40px', color: '#fff' })
  })
  it('handles values containing colons and commas', () => {
    expect(css("background: url('a.png') center / cover")['background']).toBe("url('a.png') center / cover")
  })
  it('ignores empty trailing declarations', () => {
    expect(css('color: red;')).toEqual({ color: 'red' })
  })
})
