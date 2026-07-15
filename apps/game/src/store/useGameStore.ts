import { useSyncExternalStore } from 'react'
import { engine } from '@/store/instance'
import { buildView } from '@rpsa/game-core'
import type { State, ViewModel } from '@rpsa/game-core'

/** Subscribe a component to raw engine state; re-renders on every setState. */
export function useEngineState(): State {
  return useSyncExternalStore(engine.subscribe.bind(engine), engine.getState, engine.getState)
}

/** Subscribe to state and recompute the render contract each render (pure + cheap). */
export function useView(): ViewModel {
  useEngineState()
  return buildView(engine)
}

export { engine }
