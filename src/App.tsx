import { useEffect } from 'react'
import { engine } from '@/store/useGameStore'
import { Game } from '@/game/Game'

export default function App() {
  useEffect(() => {
    engine.mount()
    return () => engine.unmount()
  }, [])
  return <Game />
}
