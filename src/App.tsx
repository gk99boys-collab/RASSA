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
      {/* Skip-to-content accessibility link */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 bg-[#E5252A] text-white border-[3px] border-[#0A0A0A] px-4 py-2 font-black rounded-[6px]"
      >
        پرش به محتوای اصلی
      </a>

      {/* Section 1: Pixel-Cursor Click & Pixel-Block Dissolve Intro */}
      {showIntro && (
        <IntroOverlay
          key={introRunId}
          onRevealStart={handleRevealStart}
          onComplete={handleIntroComplete}
        />
      )}

      {/* Subtle Parallax Pixel Decorations & 60fps Pixel Cursor Trail */}
      <ParallaxPixels />
      <PixelCursorTrail />

      {/* Main RTL Page Shell */}
      <div className="relative min-h-screen flex flex-col">
        <Navbar teamName={team.name} />

        <main className="flex-1">
          {/* Section 2: Hero */}
          <HeroSection
            name={team.name}
            tagline={team.tagline}
            loading={loading}
            ready={heroReady}
          />

          {/* Skills Marquee Ticker */}
          <SkillsMarquee members={members} />

          {/* Section 3: Achievement */}
          <AchievementSection
            achievementText={team.achievement_text}
            loading={loading}
          />

          {/* Section 4: About the Team */}
          <AboutSection
            teamName={team.name}
            description={team.description}
            loading={loading}
          />

          {/* Section 5: Members (5 Scroll-Triggered Stacking Cards incl. Mystery Card #5) */}
          <MembersSection members={members} loading={loading} />
        </main>

        {/* Section 6: Footer */}
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
