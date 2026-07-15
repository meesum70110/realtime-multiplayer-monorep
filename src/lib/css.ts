import type { CSSProperties } from 'react'

/** Parse a CSS declaration string into a React style object. Splits only on the
 *  first colon per declaration so URLs/gradients survive. Custom props (--x) pass
 *  through untouched; other props are camelCased (with -webkit-* → Webkit*). */
export function css(decl: string): CSSProperties {
  const out: Record<string, string> = {}
  for (const part of decl.split(';')) {
    const seg = part.trim()
    if (!seg) continue
    const i = seg.indexOf(':')
    if (i === -1) continue
    const rawKey = seg.slice(0, i).trim()
    const value = seg.slice(i + 1).trim()
    if (!rawKey) continue
    const key = rawKey.startsWith('--')
      ? rawKey
      : rawKey.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[key] = value
  }
  return out as CSSProperties
}
