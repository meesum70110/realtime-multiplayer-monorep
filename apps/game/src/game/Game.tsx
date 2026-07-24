import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { useIsDesktop, useIsWideDesktop } from '@/lib/useBreakpoint'

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

/** Composition root (design line 110 root `<div>`).
 *
 *  Lobby: fluid column below 1100px (sizes grow with viewport); FitStage 3-col at >=1100.
 *  In-game: desktop chrome / FitStage from >=768. */
export function Game() {
  const vm = useView()
  const isDesktop = useIsDesktop()
  const isWideDesktop = useIsWideDesktop()
  return (
    <div
      style={css(
        isDesktop
          ? "height: 100vh; background: #fdf3e5; font-family: 'Inter', sans-serif; color: #22242a; display: flex; flex-direction: column; overflow: hidden; position: relative;"
          : "height: 100dvh; max-height: 100dvh; background: #fdf3e5; font-family: 'Inter', sans-serif; color: #22242a; display: flex; flex-direction: column; overflow: hidden; position: relative;",
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
          isDesktop
            ? 'flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; align-items: stretch; justify-content: center; padding: 12px clamp(12px, 3vw, 40px) 20px; position: relative; z-index: 2;'
            : 'flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; align-items: stretch; justify-content: center; padding: 8px clamp(10px, 3vw, 20px) 16px; position: relative; z-index: 2;',
        )}
      >
        {vm.showMenu &&
          (isWideDesktop ? (
            <FitStage width={1280}>
              <MenuScreen />
            </FitStage>
          ) : (
            <div
              style={css(
                'width: 100%; height: 100%; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; box-sizing: border-box;',
              )}
            >
              <MenuScreen />
            </div>
          ))}
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
