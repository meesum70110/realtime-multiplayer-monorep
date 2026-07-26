import { useEffect, useState } from 'react'
import { engine } from '@/store/useGameStore'
import { Game } from '@/game/Game'
import { bootOnlineSession } from '@/net/bootOnline'
import { disconnectRealtime } from '@/lib/socket'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      // Runs automatically on load — Find Match only queues once transport is set.
      await bootOnlineSession(engine)
      if (cancelled) return
      engine.mount()
      setReady(true)
    })()

    return () => {
      cancelled = true
      engine.unmount()
      // Only tear down the socket after unmount; avoids racing an in-flight boot
      // when React Strict Mode remounts in development.
      disconnectRealtime()
    }
  }, [])

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0f1115',
          color: '#fffdfa',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontSize: 14,
        }}
      >
        Connecting…
      </div>
    )
  }

  return <Game />
}
