import React, { useCallback, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { useTeamData } from './hooks/useTeamData'
import { IntroOverlay } from './components/IntroOverlay'
import { PixelCursorTrail } from './components/PixelCursorTrail'
import { ParallaxPixels } from './components/ParallaxPixels'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { SkillsMarquee } from './components/SkillsMarquee'
import { AchievementSection } from './components/AchievementSection'
import { AboutSection } from './components/AboutSection'
import { MembersSection } from './components/MembersSection'
import { FooterSection } from './components/FooterSection'

export const App: React.FC = () => {
  const { team, members, loading } = useTeamData()
  const [showIntro, setShowIntro] = useState(true)
  const [heroReady, setHeroReady] = useState(false)
  const [introRunId, setIntroRunId] = useState(0)

  const handleRevealStart = useCallback(() => {
    setHeroReady(true)
  }, [])

  const handleIntroComplete = useCallback(() => {
    setHeroReady(true)
    setShowIntro(false)
  }, [])

  const handleReplayIntro = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    setHeroReady(false)
    setIntroRunId((n) => n + 1)
    setShowIntro(true)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      {/* Keyboard accessibility skip link */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 bg-[#E5252A] text-white border-[3px] border-[#080A0D] px-4 py-2 font-black rounded-[6px]"
      >
        پرش به محتوای اصلی
      </a>

      {/* Section 1: Official Event Cursor Smash-Click + Pixel-Matrix Dissolve Intro */}
      {showIntro && (
        <IntroOverlay
          key={introRunId}
          onRevealStart={handleRevealStart}
          onComplete={handleIntroComplete}
        />
      )}

      {/* Multi-Layer Scroll Parallax World & 60fps Chromatic Pixel Cursor FX */}
      <ParallaxPixels />
      <PixelCursorTrail />

      {/* Main RTL Poster Page */}
      <div className="relative min-h-screen flex flex-col">
        <Navbar teamName={team.name} />

        <main className="flex-1">
          {/* Section 2: Monumental 3D-Extruded Hero + Interactive 3D Brand Card */}
          <HeroSection
            name={team.name}
            tagline={team.tagline}
            loading={loading}
            ready={heroReady}
          />

          {/* Dual Counter-Rotating Criss-Cross Marquee Ribbons */}
          <SkillsMarquee members={members} tagline={team.tagline} />

          {/* Section 3: Championship Trophy Arena & Arcade Scoreboard */}
          <AchievementSection
            achievementText={team.achievement_text}
            loading={loading}
          />

          {/* Section 4: High-Contrast Obsidian Blueprint Bento (About) */}
          <AboutSection
            teamName={team.name}
            description={team.description}
            loading={loading}
          />

          {/* Section 5: Collectible Character-Select & Stacking Member Dossiers */}
          <MembersSection members={members} loading={loading} />
        </main>

        {/* Section 6: Grand Official Closing Poster Footer */}
        <FooterSection
          teamName={team.name}
          tagline={team.tagline}
          links={team.links}
          onReplayIntro={handleReplayIntro}
        />
      </div>
    </MotionConfig>
  )
}

export default App
