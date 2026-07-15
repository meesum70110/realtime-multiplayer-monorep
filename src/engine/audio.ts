declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

interface ToneOptions {
  t?: OscillatorType
  d?: number
  g?: number
  f2?: number | null
  delay?: number
}

interface NoiseOptions {
  d?: number
  g?: number
  from?: number
  to?: number
  type?: BiquadFilterType
  delay?: number
}

export type SfxName =
  | 'click'
  | 'beat1'
  | 'beat2'
  | 'beat3'
  | 'anything'
  | 'lock'
  | 'oppLock'
  | 'error'
  | 'tick'
  | 'count'
  | 'banner'
  | 'crack'
  | 'glassTick'
  | 'glassCrack'
  | 'tinkle'
  | 'shatter'
  | 'flip'
  | 'clash'
  | 'winRound'
  | 'loseRound'
  | 'tieRound'
  | 'match'
  | 'victory'
  | 'defeat'
  | 'alarm'

type MusicMode = 'menu' | 'battle'

/** WebAudio SFX + background music, ported verbatim from the design's logic class
 *  (ac/tone/noiseFx ~1368–1404, startMusic/stopMusic/musicTick ~1407–1447, sfx ~1448–1491).
 *  `this.state.soundOn/musicOn` reads become internal flags set via `setEnabled`;
 *  the phase→mode decision that drove `musicTick`'s `desired` moves to the caller via `setMusicMode`. */
export class AudioEngine {
  private audioCtx: AudioContext | null = null
  private soundOn = false
  private musicOn = false
  private musicTimer: number | null = null
  private mStep = 0
  private mFade = 0
  private musicMode: MusicMode = 'menu'
  private targetMusicMode: MusicMode = 'menu'

  setEnabled(sound: boolean, music: boolean): void {
    this.soundOn = sound
    this.musicOn = music
    if (!sound || !music) this.stopMusic()
    else this.startMusic()
  }

  setMusicMode(mode: MusicMode): void {
    this.targetMusicMode = mode
  }

  private ac(): AudioContext | null {
    if (!this.audioCtx) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext
        this.audioCtx = Ctor ? new Ctor() : null
      } catch {
        this.audioCtx = null
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') void this.audioCtx.resume()
    return this.audioCtx
  }

  private tone(f: number, opts: ToneOptions = {}): void {
    const { t = 'sine', d = 0.15, g = 0.2, f2 = null, delay = 0 } = opts
    const ac = this.ac()
    if (!ac) return
    const t0 = ac.currentTime + delay
    const o = ac.createOscillator(),
      gn = ac.createGain()
    o.type = t
    o.frequency.setValueAtTime(f, t0)
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + d)
    gn.gain.setValueAtTime(0.0001, t0)
    gn.gain.linearRampToValueAtTime(g, t0 + 0.008)
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
    o.connect(gn)
    gn.connect(ac.destination)
    o.start(t0)
    o.stop(t0 + d + 0.05)
  }

  private noiseFx(opts: NoiseOptions = {}): void {
    const { d = 0.2, g = 0.25, from = 400, to = 4000, type = 'bandpass', delay = 0 } = opts
    const ac = this.ac()
    if (!ac) return
    const t0 = ac.currentTime + delay
    const len = Math.max(1, Math.floor(ac.sampleRate * d))
    const buf = ac.createBuffer(1, len, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = ac.createBufferSource()
    src.buffer = buf
    const fl = ac.createBiquadFilter()
    fl.type = type
    fl.Q.value = 1.2
    fl.frequency.setValueAtTime(from, t0)
    fl.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + d)
    const gn = ac.createGain()
    gn.gain.setValueAtTime(g, t0)
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
    src.connect(fl)
    fl.connect(gn)
    gn.connect(ac.destination)
    src.start(t0)
  }

  startMusic(): void {
    if (this.musicTimer || !this.soundOn || !this.musicOn) return
    const ac = this.ac()
    if (!ac) return
    this.mStep = 0
    this.musicTimer = window.setInterval(() => this.musicTick(), 165)
  }

  stopMusic(): void {
    if (this.musicTimer) {
      clearInterval(this.musicTimer)
      this.musicTimer = null
    }
  }

  private musicTick(): void {
    if (!this.soundOn) return
    const desired = this.targetMusicMode
    if (desired !== this.musicMode) {
      this.musicMode = desired
      this.mStep = 0
      this.mFade = 0
    } else if (this.mFade < 1) this.mFade = Math.min(1, this.mFade + 0.05)
    const V = 0.28 + 0.72 * this.mFade
    const st = this.mStep % 32
    if (this.musicMode === 'menu') {
      const ROOTS = [110, 87.31, 130.81, 98]
      const root = ROOTS[Math.floor(st / 8)]
      if (st % 8 === 0) this.tone(root, { t: 'triangle', d: 0.9, g: 0.075 * V })
      if (st % 8 === 4) this.tone(root * 1.5, { t: 'triangle', d: 0.45, g: 0.05 * V })
      const MEL = [
        440, 0, 523.25, 0, 587.33, 0, 0, 659.25, 0, 523.25, 0, 440, 0, 0, 392, 0, 523.25, 0, 587.33,
        0, 659.25, 0, 0, 783.99, 0, 659.25, 0, 587.33, 0, 523.25, 0, 0,
      ]
      if (MEL[st]) this.tone(MEL[st], { t: 'sine', d: 0.3, g: 0.038 * V })
      if (st % 8 === 6)
        this.noiseFx({ d: 0.03, g: 0.014 * V, from: 7000, to: 9500, type: 'highpass' })
    } else {
      // battle: same mellow palette as the menu, a touch higher & more active so it lifts smoothly
      const ROOTS = [146.83, 130.81, 164.81, 146.83]
      const root = ROOTS[Math.floor(st / 8)]
      if (st % 8 === 0) this.tone(root, { t: 'triangle', d: 0.85, g: 0.07 * V })
      if (st % 8 === 4) this.tone(root * 1.5, { t: 'triangle', d: 0.42, g: 0.045 * V })
      const MEL = [
        659.25, 0, 587.33, 0, 659.25, 0, 783.99, 0, 659.25, 0, 587.33, 0, 523.25, 0, 0, 0, 587.33,
        0, 659.25, 0, 783.99, 0, 880, 0, 783.99, 0, 659.25, 0, 587.33, 0, 0, 0,
      ]
      if (MEL[st]) this.tone(MEL[st], { t: 'sine', d: 0.28, g: 0.04 * V })
      if (st % 4 === 0) this.tone(root / 2, { t: 'triangle', d: 0.2, g: 0.03 * V })
      if (st % 8 === 6)
        this.noiseFx({ d: 0.025, g: 0.012 * V, from: 8000, to: 10500, type: 'highpass' })
    }
    this.mStep++
  }

  sfx(name: SfxName): void {
    if (!this.soundOn) return
    this.startMusic()
    const T = (f: number, o?: ToneOptions) => this.tone(f, o),
      N = (o?: NoiseOptions) => this.noiseFx(o)
    switch (name) {
      case 'click':
        T(880, { t: 'square', d: 0.05, g: 0.12, f2: 1320 })
        break
      case 'beat1':
        T(95, { t: 'square', d: 0.16, g: 0.5, f2: 40 })
        N({ d: 0.08, g: 0.3, from: 400, to: 90, type: 'lowpass' })
        T(196, { t: 'square', d: 0.05, g: 0.1 })
        break
      case 'beat2':
        T(523, { t: 'square', d: 0.06, g: 0.2, f2: 415 })
        N({ d: 0.05, g: 0.14, from: 2600, to: 5200 })
        T(659, { t: 'square', d: 0.08, g: 0.2, f2: 523, delay: 0.12 })
        N({ d: 0.06, g: 0.14, from: 3000, to: 6000, delay: 0.12 })
        break
      case 'beat3':
        T(3200, { t: 'square', d: 0.03, g: 0.2, f2: 2200 })
        N({ d: 0.035, g: 0.18, from: 7000, to: 10000, type: 'highpass' })
        T(3500, { t: 'square', d: 0.035, g: 0.2, f2: 2400, delay: 0.14 })
        N({ d: 0.045, g: 0.18, from: 7500, to: 10500, type: 'highpass', delay: 0.14 })
        break
      case 'anything':
        ;[392, 523, 659, 784].forEach((f, i) =>
          T(f, { t: 'square', d: 0.11, g: 0.2, delay: i * 0.07 }),
        )
        T(1047, { t: 'square', d: 0.32, g: 0.22, delay: 0.28 })
        T(1319, { t: 'square', d: 0.3, g: 0.1, delay: 0.32 })
        N({ d: 0.4, g: 0.1, from: 2000, to: 10000, type: 'highpass', delay: 0.24 })
        break
      case 'lock':
        T(988, { t: 'square', d: 0.07, g: 0.18 })
        T(1319, { t: 'square', d: 0.16, g: 0.18, delay: 0.07 })
        break
      case 'oppLock':
        T(330, { t: 'square', d: 0.06, g: 0.12 })
        T(262, { t: 'square', d: 0.1, g: 0.12, delay: 0.07 })
        break
      case 'error':
        T(98, { t: 'sawtooth', d: 0.11, g: 0.2, f2: 62 })
        T(92, { t: 'sawtooth', d: 0.14, g: 0.2, f2: 58, delay: 0.13 })
        break
      case 'tick':
        T(1568, { t: 'square', d: 0.035, g: 0.11 })
        T(784, { t: 'square', d: 0.03, g: 0.06 })
        break
      case 'count':
        T(587, { t: 'square', d: 0.09, g: 0.2 })
        T(587, { t: 'square', d: 0.05, g: 0.08, delay: 0.02 })
        break
      case 'banner':
        T(392, { t: 'square', d: 0.1, g: 0.2 })
        T(587, { t: 'square', d: 0.16, g: 0.2, delay: 0.09 })
        break
      case 'crack':
        N({ d: 0.035, g: 0.34, from: 9000, to: 5200, type: 'highpass' })
        T(5200, { t: 'triangle', d: 0.03, g: 0.12, f2: 3000 })
        break
      case 'glassTick':
        N({ d: 0.04, g: 0.11, from: 7200, to: 3000, type: 'highpass' })
        T(3400 + Math.random() * 1400, { t: 'triangle', d: 0.035, g: 0.05, f2: 1500 })
        break
      case 'glassCrack':
        N({ d: 0.06, g: 0.32, from: 8200, to: 2600, type: 'highpass' })
        T(4200, { t: 'triangle', d: 0.05, g: 0.16, f2: 1600 })
        ;[0.035, 0.08, 0.13].forEach((dl) =>
          N({
            d: 0.03,
            g: 0.12,
            from: 5000 + Math.random() * 3600,
            to: 2000,
            type: 'bandpass',
            delay: dl,
          }),
        )
        T(150, { t: 'triangle', d: 0.09, g: 0.07, f2: 80, delay: 0.02 })
        break
      case 'tinkle':
        Array.from({ length: 6 }).forEach((_, i) =>
          T(2800 + Math.random() * 2800, {
            t: 'triangle',
            d: 0.13,
            g: 0.045,
            f2: 1100,
            delay: i * 0.06 + Math.random() * 0.03,
          }),
        )
        break
      case 'shatter':
        N({ d: 0.5, g: 0.44, from: 9500, to: 1100, type: 'highpass' })
        ;[5400, 4500, 3700, 3000, 2400].forEach((f, i) =>
          T(f, { t: 'triangle', d: 0.17, g: 0.11, f2: f * 0.55, delay: i * 0.045 }),
        )
        ;[0.02, 0.11, 0.2, 0.31, 0.44].forEach((dl) =>
          N({
            d: 0.08,
            g: 0.13,
            from: 7000 + Math.random() * 3200,
            to: 2800,
            type: 'bandpass',
            delay: dl,
          }),
        )
        break
      case 'flip':
        T(220, { t: 'square', d: 0.13, g: 0.15, f2: 880 })
        T(220, { t: 'square', d: 0.13, g: 0.15, f2: 880, delay: 0.18 })
        break
      case 'clash':
        N({ d: 0.5, g: 0.6, from: 3000, to: 55, type: 'lowpass', delay: 0.38 })
        T(90, { t: 'square', d: 0.5, g: 0.5, f2: 28, delay: 0.38 })
        N({ d: 0.07, g: 0.3, from: 5000, to: 9000, type: 'highpass', delay: 0.38 })
        break
      case 'winRound':
        ;[523, 659, 784, 1047].forEach((f, i) =>
          T(f, { t: 'square', d: 0.1, g: 0.2, delay: 0.5 + i * 0.07 }),
        )
        T(1319, { t: 'square', d: 0.25, g: 0.14, delay: 0.82 })
        break
      case 'loseRound':
        T(311, { t: 'sawtooth', d: 0.2, g: 0.18, f2: 233, delay: 0.5 })
        T(233, { t: 'sawtooth', d: 0.32, g: 0.18, f2: 155, delay: 0.72 })
        break
      case 'tieRound':
        T(440, { t: 'square', d: 0.1, g: 0.15, delay: 0.5 })
        T(415, { t: 'square', d: 0.18, g: 0.15, f2: 466, delay: 0.66 })
        break
      case 'match':
        T(784, { t: 'square', d: 0.08, g: 0.18 })
        T(1047, { t: 'square', d: 0.18, g: 0.18, delay: 0.1 })
        break
      case 'victory':
        ;[
          [523, 0],
          [523, 0.12],
          [523, 0.24],
          [659, 0.36],
          [784, 0.52],
          [1047, 0.7],
        ].forEach((n) => T(n[0], { t: 'square', d: n[1] > 0.6 ? 0.4 : 0.13, g: 0.2, delay: n[1] }))
        N({ d: 0.6, g: 0.08, from: 3000, to: 10000, type: 'highpass', delay: 0.7 })
        break
      case 'defeat':
        ;[
          [349, 0],
          [330, 0.3],
          [311, 0.6],
          [233, 0.95],
        ].forEach((n) => T(n[0], { t: 'sawtooth', d: 0.32, g: 0.14, f2: n[0] * 0.92, delay: n[1] }))
        break
      case 'alarm':
        ;[0, 0.15, 0.3].forEach((dl) => T(1245, { t: 'square', d: 0.09, g: 0.16, delay: dl }))
        break
    }
  }

  dispose(): void {
    this.stopMusic()
    if (this.audioCtx) {
      try {
        void this.audioCtx.close()
      } catch {
        /* already closed */
      }
      this.audioCtx = null
    }
  }
}
