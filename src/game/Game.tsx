import { useView } from '@/store/useGameStore'

/** Temporary composition root — proves the engine↔React pipe is live. The morph
 *  symbol readout changes ~every 1.15s on the menu, confirming re-renders fire.
 *  Replaced by the real phase/overlay switch in a later task. */
export function Game() {
  const vm = useView()
  return (
    <div>
      {vm.showMenu ? 'MENU' : 'GAME'} · morph: {vm.morphSym}
    </div>
  )
}
