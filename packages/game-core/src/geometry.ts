import type { CSSProperties } from 'react'
import type {
  Burst,
  ClashAnim,
  ClashStep,
  DieAnim,
  Pane,
  PaneFacet,
  PaneFrag,
  PaneLine,
  Shard,
} from './types'

/** Cast a plain declaration object (incl. CSS custom properties like `--tx`) to a React style. */
const asStyle = (obj: Record<string, string | number>): CSSProperties => obj as CSSProperties

export type ClashRole = 'win' | 'lose' | 'tie'

// ---- faceted glass shard barrier ----
// centerline / half-width helpers — a tall glass slab leaning gently on a diagonal
export function barrierCx(t: number): number {
  return 60 - 22 * t // top leans right, bottom leans left
}
export function barrierHw(t: number): number {
  return 32 - 5 * t - 3 * Math.sin(t * Math.PI) // near-vertical slab, softly waisted
}

export function makeBarrierPane(): Pane {
  const R = 11
  const edges: { y: number; l: number; r: number }[] = []
  const sx: number[] = []
  for (let i = 0; i <= R; i++) {
    const t = i / R
    const cx = barrierCx(t)
    const hw = barrierHw(t)
    const j = (n: number) => (i === 0 || i === R ? 0 : (Math.random() - 0.5) * n)
    const l = +(cx - hw + j(4)).toFixed(1),
      r = +(cx + hw + j(4)).toFixed(1)
    edges.push({ y: +(t * 100).toFixed(1), l, r })
    sx.push(+(l + (r - l) * (0.42 + Math.random() * 0.16)).toFixed(1))
  }
  const clampIn = (x: number, y: number): [number, number] => {
    const tt = Math.max(0, Math.min(1, y / 100))
    const cxx = barrierCx(tt),
      hww = barrierHw(tt)
    return [Math.max(cxx - hww + 1.4, Math.min(cxx + hww - 1.4, x)), Math.max(1, Math.min(99, y))]
  }
  const facets: PaneFacet[] = []
  for (let i = 0; i < R; i++) {
    const a = edges[i],
      b = edges[i + 1]
    const mk = (poly: [number, number][], side: -1 | 1) => {
      const wht = 0.4 + Math.random() * 0.38
      const teal = 0.22 + Math.random() * 0.24
      facets.push({
        clip: 'polygon(' + poly.map((p) => p[0] + '% ' + p[1] + '%').join(', ') + ')',
        bg:
          'linear-gradient(' +
          Math.round(95 + Math.random() * 30) +
          'deg, rgba(255,255,255,' +
          wht.toFixed(2) +
          '), rgba(0,190,169,' +
          teal.toFixed(2) +
          ') 48%, rgba(214,247,243,' +
          (wht * 0.7).toFixed(2) +
          '))',
        tx: Math.round(side * (46 + Math.random() * 120)) + 'px',
        ty:
          Math.round(
            ((a.y + b.y) / 2 < 34 ? -1 : (a.y + b.y) / 2 > 60 ? 1 : Math.random() - 0.5) *
              (34 + Math.random() * 92),
          ) + 'px',
        rot: Math.round(side * (120 + Math.random() * 340)) + 'deg',
        dur: (0.92 + Math.random() * 0.5).toFixed(2),
        delay: (0.36 + (Math.abs((a.y + b.y) / 2 - 33) / 100) * 0.5 + Math.random() * 0.05).toFixed(
          2,
        ),
      })
    }
    mk(
      [
        [a.l, a.y],
        [sx[i], a.y],
        [sx[i + 1], b.y],
        [b.l, b.y],
      ],
      -1,
    )
    mk(
      [
        [sx[i], a.y],
        [a.r, a.y],
        [b.r, b.y],
        [sx[i + 1], b.y],
      ],
      1,
    )
  }
  const outline = edges
    .map((e) => e.l + ',' + e.y)
    .concat([...edges].reverse().map((e) => e.r + ',' + e.y))
    .join(' ')
  const outlineClip =
    'polygon(' +
    edges
      .map((e) => e.l + '% ' + e.y + '%')
      .concat([...edges].reverse().map((e) => e.r + '% ' + e.y + '%'))
      .join(', ') +
    ')'
  const crack = sx.map((x, i) => x + ',' + edges[i].y).join(' ')
  const lines: PaneLine[] = []
  // faint horizontal stress seams between rows (reveal late)
  for (let i = 1; i < R; i++)
    lines.push({
      t0: 0.5 + Math.random() * 0.3,
      pts: edges[i].l + ',' + edges[i].y + ' ' + edges[i].r + ',' + edges[i].y,
      style: { opacity: 0.28, strokeWidth: 0.8 },
    })

  // proper impact web: jagged radiating rays + secondary splinter forks + concentric connective webbing
  const mkWeb = (
    ix: number,
    iy: number,
    count: number,
    minLen: number,
    maxLen: number,
    weight: number,
    t0base: number,
    t0span: number,
  ): PaneLine[] => {
    const out: PaneLine[] = []
    const ends: [number, number][] = []
    for (let r = 0; r < count; r++) {
      const rayT0 = t0base + (r / count) * t0span + Math.random() * 0.04
      const baseAng = (r / count) * Math.PI * 2 + 0.25 + (Math.random() - 0.5) * 0.4
      const len = minLen + Math.random() * (maxLen - minLen)
      const pts = [ix.toFixed(1) + ',' + iy.toFixed(1)]
      let px = ix,
        py = iy
      const segN = 4
      for (let sg = 1; sg <= segN; sg++) {
        const frac = sg / segN
        const ang = baseAng + (Math.random() - 0.5) * 0.7
        ;[px, py] = clampIn(ix + Math.cos(ang) * len * frac, iy + Math.sin(ang) * len * frac * 0.5)
        pts.push(px.toFixed(1) + ',' + py.toFixed(1))
      }
      ends.push([px, py])
      out.push({
        t0: rayT0,
        pts: pts.join(' '),
        style: {
          opacity: 0.72 + Math.random() * 0.28,
          strokeWidth: Number((weight * 1.25 * (1 - (r % 2) * 0.2)).toFixed(2)),
        },
      })
      // splinter fork branching off the ray mid-way
      if (Math.random() < 0.75) {
        const bi = 2 + Math.floor(Math.random() * 2)
        const bx0 = +pts[bi].split(',')[0],
          by0 = +pts[bi].split(',')[1]
        const bang = baseAng + (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5)
        const blen = len * (0.3 + Math.random() * 0.3)
        const [bx, by] = clampIn(bx0 + Math.cos(bang) * blen, by0 + Math.sin(bang) * blen * 0.5)
        out.push({
          t0: rayT0 + 0.04,
          pts: bx0.toFixed(1) + ',' + by0.toFixed(1) + ' ' + bx.toFixed(1) + ',' + by.toFixed(1),
          style: {
            opacity: 0.48 + Math.random() * 0.3,
            strokeWidth: Number((weight * 0.8).toFixed(2)),
          },
        })
      }
    }
    // concentric connective rings between adjacent rays (reveal after their rays)
    let ri = 0
    for (const fr of [0.32, 0.58, 0.82]) {
      ri++
      for (let r = 0; r < count; r++) {
        if (Math.random() < 0.22) continue
        const a = ends[r],
          b = ends[(r + 1) % count]
        const [ax, ay] = clampIn(ix + (a[0] - ix) * fr, iy + (a[1] - iy) * fr)
        const [bx, by] = clampIn(ix + (b[0] - ix) * fr, iy + (b[1] - iy) * fr)
        const mx = (ax + bx) / 2 + (Math.random() - 0.5) * 2.6,
          my = (ay + by) / 2 + (Math.random() - 0.5) * 2.6
        out.push({
          t0: t0base + 0.14 + ri * 0.14 + Math.random() * 0.05,
          pts:
            ax.toFixed(1) +
            ',' +
            ay.toFixed(1) +
            ' ' +
            mx.toFixed(1) +
            ',' +
            my.toFixed(1) +
            ' ' +
            bx.toFixed(1) +
            ',' +
            by.toFixed(1),
          style: {
            opacity: 0.4 + Math.random() * 0.24,
            strokeWidth: Number((weight * 0.7).toFixed(2)),
          },
        })
      }
    }
    return out
  }
  // main impact sits behind the timer; a smaller secondary impact lower on the slab
  lines.push(...mkWeb(50, 33, 20, 26, 54, 2.2, 0.0, 0.6))
  lines.push(...mkWeb(40, 71, 13, 16, 30, 1.5, 0.28, 0.5))
  lines.push(...mkWeb(58, 54, 9, 12, 22, 1.3, 0.4, 0.42))
  // long lone stress fractures spanning the slab
  for (let k = 0; k < 7; k++) {
    const y0 = 8 + Math.random() * 20,
      y1 = y0 + 30 + Math.random() * 40
    const [x0, yy0] = clampIn(barrierCx(y0 / 100) + (Math.random() - 0.5) * 30, y0)
    const [xm, ym] = clampIn(
      barrierCx((y0 + y1) / 2 / 100) + (Math.random() - 0.5) * 24,
      (y0 + y1) / 2,
    )
    const [x1, yy1] = clampIn(barrierCx(y1 / 100) + (Math.random() - 0.5) * 30, y1)
    lines.push({
      t0: 0.34 + Math.random() * 0.4,
      pts:
        x0.toFixed(1) +
        ',' +
        yy0.toFixed(1) +
        ' ' +
        xm.toFixed(1) +
        ',' +
        ym.toFixed(1) +
        ' ' +
        x1.toFixed(1) +
        ',' +
        yy1.toFixed(1),
      style: { opacity: 0.42 + Math.random() * 0.24, strokeWidth: 0.95 },
    })
  }
  const CLIPS = [
    'polygon(50% 0%, 100% 62%, 18% 100%)',
    'polygon(0% 30%, 100% 0%, 70% 100%)',
    'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  ]
  const frags: PaneFrag[] = Array.from({ length: 7 }, (_, i) => {
    const side = i % 2 ? 1 : -1
    return {
      x: Math.round(150 + side * (80 + Math.random() * 88)),
      y: Math.round(24 + Math.random() * 540),
      s: Math.round(9 + Math.random() * 13),
      clip: CLIPS[i % CLIPS.length],
      dl: (Math.random() * 2).toFixed(1),
      tx: Math.round(side * (30 + Math.random() * 90)) + 'px',
      ty: '0px',
      rot: Math.round(side * 300 + Math.random() * 200) + 'deg',
    }
  })
  return { outline, outlineClip, crack, lines, facets, frags }
}

export function paneWrap(mode: 'typing' | 'break'): CSSProperties {
  // taller slab that nearly reaches the floor; the diagonal lean lives in the shape itself
  const base: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '-34px',
    width: '300px',
    height: '548px',
    marginLeft: '-150px',
    zIndex: 2,
    pointerEvents: 'none',
    filter:
      'drop-shadow(0 8px 16px rgba(0,201,184,0.3)) drop-shadow(0 2px 4px rgba(34,36,42,0.12))',
  }
  if (mode === 'typing') {
    base.transformOrigin = 'center bottom'
    base.animation = 'barrierBuild 0.6s cubic-bezier(0.3, 1.2, 0.4, 1) both'
  } else {
    base.animation = 'paneJitter 0.7s linear both'
    base.filter = 'none'
  }
  return base
}

export function facetStyle(f: PaneFacet, breaking: boolean): CSSProperties {
  const st: Record<string, string> = {
    position: 'absolute',
    inset: '0px',
    clipPath: f.clip,
    background: f.bg,
  }
  if (breaking) {
    st['--tx'] = f.tx
    st['--ty'] = f.ty
    st['--rot'] = f.rot
    st.animation = 'paneFly ' + f.dur + 's cubic-bezier(0.32, 0.62, 0.5, 1) ' + f.delay + 's both'
    st.willChange = 'transform, opacity'
    st.filter = 'brightness(1.18) drop-shadow(0 2px 3px rgba(9,74,79,0.4))'
  }
  return asStyle(st)
}

export function fragStyle(fr: PaneFrag, breaking: boolean): CSSProperties {
  const st: Record<string, string> = {
    position: 'absolute',
    left: fr.x + 'px',
    top: fr.y + 'px',
    width: fr.s + 'px',
    height: Math.round(fr.s * 1.5) + 'px',
    clipPath: fr.clip,
    background: 'linear-gradient(115deg, rgba(255,255,255,0.75), rgba(0,201,184,0.2))',
  }
  if (breaking) {
    st['--tx'] = fr.tx
    st['--rot'] = fr.rot
    st.animation =
      'paneFall 1.15s cubic-bezier(0.5, 0.05, 0.85, 0.4) ' +
      (0.72 + (fr.y / 650) * 0.5).toFixed(2) +
      's both'
    st.willChange = 'transform, opacity'
  } else st.animation = 'floatIdle ' + (3 + +fr.dl) + 's ease-in-out ' + fr.dl + 's infinite'
  return asStyle(st)
}

export function makeBarrierShards(): Shard[] {
  const colors = ['#ffffff', '#d6f0ee', '#bfeae6', '#9fe6df']
  return Array.from({ length: 20 }, (_, i) => {
    const side = i % 2 ? 1 : -1
    return {
      style: asStyle({
        position: 'absolute',
        left: '50%',
        top: 4 + Math.random() * 84 + '%',
        width: 4 + Math.random() * 6 + 'px',
        height: 9 + Math.random() * 14 + 'px',
        background: colors[i % colors.length],
        borderRadius: '2px',
        zIndex: 2,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        '--tx': Math.round(side * (30 + Math.random() * 130)) + 'px',
        '--ty': Math.round(140 + Math.random() * 320) + 'px',
        '--rot': Math.round((Math.random() - 0.5) * 720) + 'deg',
        animation:
          'shardFly ' +
          (0.9 + Math.random() * 0.5).toFixed(2) +
          's cubic-bezier(0.5, 0.05, 0.85, 0.4) ' +
          (0.42 + Math.random() * 0.5).toFixed(2) +
          's both',
      }),
    }
  })
}

export function makeShards(baseDelay: number): Shard[] {
  const colors = ['#f6c945', '#ff8a6e', '#00c9b8', '#fffdfa', '#ff4d6d']
  return Array.from({ length: 16 }, (_, i) => {
    const ang = (i / 16) * Math.PI * 2 + Math.random() * 0.4
    const dist = 90 + Math.random() * 130
    return {
      style: asStyle({
        position: 'absolute',
        left: '50%',
        top: '165px',
        width: 5 + Math.random() * 7 + 'px',
        height: 10 + Math.random() * 12 + 'px',
        background: colors[i % colors.length],
        borderRadius: '2px',
        zIndex: 3,
        pointerEvents: 'none',
        '--tx': Math.round(Math.cos(ang) * dist) + 'px',
        '--ty': Math.round(Math.sin(ang) * dist - 30) + 'px',
        '--rot': Math.round((Math.random() - 0.5) * 720) + 'deg',
        animation:
          'shardFly ' +
          (0.55 + Math.random() * 0.35) +
          's cubic-bezier(0.2, 0.8, 0.4, 1) ' +
          (baseDelay + Math.random() * 0.08).toFixed(2) +
          's both',
      }),
    }
  })
}

export function makeBurst(emoji: string): Burst[] {
  return Array.from({ length: 8 }, () => {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.8
    const dist = 110 + Math.random() * 120
    return {
      emoji,
      style: asStyle({
        position: 'absolute',
        left: '50%',
        top: '38%',
        fontSize: 20 + Math.random() * 18 + 'px',
        zIndex: 4,
        pointerEvents: 'none',
        '--bx': Math.round(Math.cos(ang) * dist) + 'px',
        '--by': Math.round(Math.sin(ang) * dist) + 'px',
        '--rot': Math.round((Math.random() - 0.5) * 360) + 'deg',
        animation:
          'burstUp ' +
          (0.9 + Math.random() * 0.5) +
          's cubic-bezier(0.2, 0.7, 0.4, 1) ' +
          (0.5 + Math.random() * 0.25) +
          's both',
      }),
    }
  })
}

export function clashWrap(
  mine: boolean,
  step: ClashStep,
  role: ClashRole,
  clashAnim: ClashAnim,
  dieAnim: DieAnim,
): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    top: '0px',
    width: '250px',
    height: '330px',
    borderRadius: '26px',
    willChange: 'transform',
    zIndex: 2,
  }
  base[mine ? 'left' : 'right'] = '75px'
  if (step === 'break' || step === 'impact' || step === 'fight') {
    const M: Record<ClashAnim, [string, string]> = {
      rush: [
        mine ? 'arenaLungeL' : 'arenaLungeR',
        '0.85s cubic-bezier(0.55, -0.2, 0.35, 1.15) 2.3s',
      ],
      sky: [mine ? 'skySlamL' : 'skySlamR', '0.9s cubic-bezier(0.5, -0.25, 0.3, 1.1) 2.25s'],
      cyclone: [mine ? 'cycloneL' : 'cycloneR', '0.95s cubic-bezier(0.45, -0.15, 0.3, 1.05) 2.25s'],
      upper: [mine ? 'upperL' : 'upperR', '0.9s cubic-bezier(0.5, -0.2, 0.35, 1.1) 2.2s'],
    }
    const m = M[clashAnim] || M.rush
    base.animation = m[0] + ' ' + m[1] + ' both'
  } else if (role === 'win') {
    base.animation =
      (mine ? 'winArenaL' : 'winArenaR') + ' 0.8s cubic-bezier(0.3, 1.1, 0.4, 1) both'
    base.filter = 'drop-shadow(0 20px 44px rgba(238,181,47,0.55))'
    base.zIndex = 3
  } else if (role === 'lose') {
    const D: Record<DieAnim, [string, string]> = {
      launch: [mine ? 'loseArenaL' : 'loseArenaR', '1.1s cubic-bezier(0.5, 0, 0.9, 0.5) 0.15s'],
      drop: [mine ? 'dieDropL' : 'dieDropR', '1.35s cubic-bezier(0.55, 0, 0.8, 0.45) 0.1s'],
      spin: [mine ? 'dieSpinL' : 'dieSpinR', '1.3s cubic-bezier(0.5, 0.05, 0.75, 0.4) 0.15s'],
      blast: [mine ? 'dieBlastL' : 'dieBlastR', '0.95s cubic-bezier(0.3, 0, 0.7, 0.35) 0.12s'],
    }
    const d = D[dieAnim] || D.launch
    base.animation = d[0] + ' ' + d[1] + ' both'
  } else {
    base.animation = (mine ? 'tieArenaL' : 'tieArenaR') + ' 0.7s cubic-bezier(0.3, 1, 0.4, 1) both'
    base.filter = 'saturate(0.65)'
    base.opacity = 0.9
  }
  return base
}
