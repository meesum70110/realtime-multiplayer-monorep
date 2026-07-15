import type { MorphSym } from '@rpsa/game-core'

/** SVG path per morph symbol (design `morphIconNode`, lines ~1349–1365). */
const PATHS: Record<Exclude<MorphSym, 'q'>, string> = {
  fire: 'M12 2c2 3 1 5 0 6 3-1 4-3 4-3 2 2 3 5 3 8a7 7 0 1 1-14 0c0-2 1-4 3-5-1 2 0 4 2 4 2 0 3-1 3-3 0-2-1-4-4-7z',
  drop: 'M12 2c4 5 7 8 7 12a7 7 0 1 1-14 0c0-4 3-7 7-12z',
  leaf: 'M4 20c0-9 6-16 16-16 0 10-6 16-16 16zm2-2c5-4 8-7 9-11-4 2-8 5-9 11z',
  zap: 'M13 2 4 13h6l-1 9 9-11h-6z',
  star: 'M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17l-5.9 3 1.3-6.5L2.5 8.9l6.6-.8z',
  heart:
    'M12 21C6 16 3 12.5 3 8.8 3 6 5.2 4 7.7 4c1.7 0 3.2.9 4.3 2.3C13.1 4.9 14.6 4 16.3 4 18.8 4 21 6 21 8.8c0 3.7-3 7.2-9 12.2z',
  moon: 'M13 2a9 9 0 1 0 9 11 7 7 0 0 1-9-11z',
  crown: 'M3 8l4 4 5-8 5 8 4-4-2 12H5z',
  gem: 'M6 3h12l4 6-10 12L2 9zm1.2 6h9.6L15 5H9z',
  skull:
    'M12 2C7 2 3 5.7 3 10.2c0 2.7 1.4 5 3.5 6.4V20a1 1 0 0 0 1 1h1v-2h1v2h3v-2h1v2h1a1 1 0 0 0 1-1v-3.4c2.1-1.4 3.5-3.7 3.5-6.4C21 5.7 17 2 12 2zM8.5 13a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zm7 0a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6z',
}

/** Ink (fill) per symbol — mirrors the design's `_morphPalette` inks so the icon
 *  renders correctly without a caller supplying `ink`. */
const INK: Record<Exclude<MorphSym, 'q'>, string> = {
  fire: '#8a3300',
  drop: '#0a3f7a',
  leaf: '#1c5c1a',
  zap: '#3a1c78',
  star: '#7a4a00',
  heart: '#7a1249',
  moon: '#26307a',
  crown: '#7a4a00',
  gem: '#0a5257',
  skull: '#521278',
}

/** Renders the morphing menu-logo glyph (design `morphIconNode`). `'q'` is the
 *  question-mark rest state; every other symbol is an SVG path filled with `ink`
 *  (defaults to the design palette's ink for that symbol). */
export function MorphIcon({ sym, ink }: { sym: MorphSym; ink?: string }) {
  if (sym === 'q') {
    return (
      <span
        style={{ fontSize: '42px', fontWeight: 900, color: '#22242a', lineHeight: 1 }}
      >
        ?
      </span>
    )
  }
  const fill = ink ?? INK[sym]
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} fill={fill}>
      <path d={PATHS[sym] ?? PATHS.star} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )
}
