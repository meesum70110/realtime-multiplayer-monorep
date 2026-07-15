import { GameEngine } from '@rpsa/game-core'

/** The single, app-wide engine instance. */
export const engine = new GameEngine()

// Dispose timers/audio on hot-module replacement so reloads don't leak intervals.
if (import.meta.hot) import.meta.hot.dispose(() => engine.unmount())
