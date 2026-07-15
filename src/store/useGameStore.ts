import { useSyncExternalStore } from 'react'
import { engine } from '@/engine/instance'
import { buildView } from '@/engine/view'
import type { State, ViewModel } from '@/engine/types'

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
