import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'

import { FitStage } from '@/lib/FitStage'
import { ArenaBackground } from '@/components/ArenaBackground'
import { PanicVignette } from '@/components/PanicVignette'
import { SoundToggle } from '@/components/SoundToggle'
import { ExitMatchButton } from '@/components/ExitMatchButton'

import { ChatWidget } from '@/overlays/ChatWidget'
import { ProfileModal } from '@/overlays/ProfileModal'
import { ExitConfirm } from '@/overlays/ExitConfirm'
import { SettingsModal } from '@/overlays/SettingsModal'
import { ProfileSettings } from '@/overlays/ProfileSettings'
import { InviteModal } from '@/overlays/InviteModal'
import { HowToOverlay } from '@/overlays/HowToOverlay'
import { TutorialConfirm } from '@/overlays/TutorialConfirm'
import { CoachOverlay } from '@/overlays/CoachOverlay'

import { Scoreboard } from '@/screens/Scoreboard'
import { MenuScreen } from '@/screens/MenuScreen'
import { MatchmakingScreen } from '@/screens/MatchmakingScreen'
import { RoundIntro } from '@/screens/RoundIntro'
import { RoundBanner } from '@/screens/RoundBanner'
import { ArenaScreen } from '@/screens/ArenaScreen'
import { ClashStage } from '@/screens/ClashStage'
import { EndScreen } from '@/screens/EndScreen'

/** Composition root (design line 110 root `<div>`). Renders the fixed chrome
 *  (background, panic vignette, sound toggle), the overlay stack (design DOM
 *  order, lines 135–467), the in-game scoreboard header (line 468), then the
 *  STAGE `<main>` phase switch (line 548). Each screen/overlay reads the
 *  view-model itself, so this root only routes on the phase/overlay flags. */
export function Game() {
  const vm = useView()
  return (
    <div
      style={css(
        "min-height: 100vh; background: #fdf3e5; font-family: 'Inter', sans-serif; color: #22242a; display: flex; flex-direction: column; overflow: hidden; position: relative;",
      )}
    >
      <ArenaBackground />
      <PanicVignette />
      <SoundToggle />

      <ChatWidget />
      <ProfileModal />
      <ExitConfirm />
      <SettingsModal />
      <ProfileSettings />
      <InviteModal />
      <HowToOverlay />
      <TutorialConfirm />
      <CoachOverlay />

      {vm.inGame && <Scoreboard />}
      <ExitMatchButton />

      <main
        style={css(
          'flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px clamp(12px, 4vw, 48px) 28px; position: relative; z-index: 2;',
        )}
      >
        {vm.showMenu && (
          <FitStage width={1280}>
            <MenuScreen />
          </FitStage>
        )}
        {vm.showSearching && <MatchmakingScreen />}
        {vm.showIntro && <RoundIntro />}
        {vm.showBanner && <RoundBanner />}
        {vm.showTyping && (
          <FitStage width={1000}>
            <ArenaScreen />
          </FitStage>
        )}
        {vm.showClash && <ClashStage />}
        {vm.showEnd && <EndScreen />}
      </main>
    </div>
  )
}
