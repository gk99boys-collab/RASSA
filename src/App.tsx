import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion'
import { useTeamData } from './hooks/useTeamData'
import { normalizeLinks } from './lib/supabase'
import { AmbientBackdrop, type SceneKey } from './components/AmbientBackdrop'
import { EventLogo, RasaMark } from './components/BrandMarks'
import { MinimalIntro } from './components/MinimalIntro'
import { LIQUID_SPRING, renderLinkIcon, SILK_EASE } from './components/MotionPrimitives'
import { HeroScene } from './components/scenes/HeroScene'
import { AboutScene } from './components/scenes/AboutScene'
import { AchievementScene } from './components/scenes/AchievementScene'
import { MembersScene } from './components/scenes/MembersScene'

const SCENES: { key: SceneKey; label: string }[] = [
  { key: 'hero', label: 'معرفی' },
  { key: 'about', label: 'درباره' },
  { key: 'achievement', label: 'افتخار' },
  { key: 'members', label: 'اعضا' },
]

const SingleStageApp: React.FC = () => {
  const { team, members, loading } = useTeamData()
  const shouldReduceMotion = useReducedMotion()

  const [showIntro, setShowIntro] = useState(true)
  const [stageReady, setStageReady] = useState(false)
  const [activeScene, setActiveScene] = useState<SceneKey>('hero')
  const [sceneDirection, setSceneDirection] = useState<1 | -1>(1)
  const [memberIndex, setMemberIndex] = useState(0)
  const [memberDirection, setMemberDirection] = useState<1 | -1>(1)

  const wheelLockRef = useRef(0)
  const wheelAccumRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const centerScrollRef = useRef<HTMLElement | null>(null)
  const sceneIndex = SCENES.findIndex((s) => s.key === activeScene)

  const navigateTo = useCallback(
    (next: SceneKey) => {
      const currIdx = SCENES.findIndex((s) => s.key === activeScene)
      const nextIdx = SCENES.findIndex((s) => s.key === next)
      if (nextIdx === -1 || nextIdx === currIdx) return
      setSceneDirection(nextIdx > currIdx ? 1 : -1)
      if (next === 'members' && activeScene !== 'members') {
        setMemberIndex(0)
        setMemberDirection(1)
      }
      setActiveScene(next)
    },
    [activeScene]
  )

  const selectMember = useCallback(
    (nextIdx: number) => {
      if (members.length === 0 || nextIdx === memberIndex) return
      setMemberDirection(nextIdx > memberIndex ? 1 : -1)
      setMemberIndex(nextIdx)
    },
    [memberIndex, members.length]
  )

  const stepMemberWrap = useCallback(
    (delta: 1 | -1) => {
      const total = members.length
      if (total === 0) return
      setMemberDirection(delta)
      setMemberIndex((prev) => (prev + delta + total) % total)
    },
    [members.length]
  )

  /**
   * Seamless progression across the single section:
   * معرفی -> درباره -> افتخار -> عضو ۰۱ .. عضو ۰۵ (and reverse)
   */
  const stepFlow = useCallback(
    (delta: 1 | -1) => {
      const totalMembers = members.length

      if (activeScene === 'members' && totalMembers > 0) {
        const nextMember = memberIndex + delta
        if (nextMember >= 0 && nextMember < totalMembers) {
          setMemberDirection(delta)
          setMemberIndex(nextMember)
          return
        }
        if (delta === -1) {
          setSceneDirection(-1)
          setActiveScene('achievement')
        }
        return
      }

      const currIdx = SCENES.findIndex((s) => s.key === activeScene)
      const nextIdx = currIdx + delta
      if (nextIdx < 0 || nextIdx >= SCENES.length) return
      const target = SCENES[nextIdx].key
      setSceneDirection(delta)
      if (target === 'members') {
        setMemberIndex(0)
        setMemberDirection(1)
      }
      setActiveScene(target)
    },
    [activeScene, memberIndex, members.length]
  )

  const handleIntroReveal = useCallback(() => setStageReady(true), [])
  const handleIntroComplete = useCallback(() => {
    setStageReady(true)
    setShowIntro(false)
  }, [])

  // Smooth wheel / trackpad gesture glides effortlessly across views & members
  useEffect(() => {
    if (showIntro) return

    const onWheel = (e: WheelEvent) => {
      const scroller = centerScrollRef.current
      if (scroller && scroller.scrollHeight > scroller.clientHeight + 8) {
        const atTop = scroller.scrollTop <= 2
        const atBottom =
          scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
          return
        }
      }
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return

      const now = performance.now()
      if (now - wheelLockRef.current < 580) {
        wheelAccumRef.current = 0
        return
      }

      wheelAccumRef.current += e.deltaY
      if (Math.abs(wheelAccumRef.current) >= 52) {
        const dir: 1 | -1 = wheelAccumRef.current > 0 ? 1 : -1
        wheelAccumRef.current = 0
        wheelLockRef.current = now
        stepFlow(dir)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [showIntro, stepFlow])

  // RTL-aware keyboard navigation
  useEffect(() => {
    if (showIntro) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowDown' ||
        e.key === 'PageDown' ||
        e.key === 'ArrowLeft'
      ) {
        e.preventDefault()
        stepFlow(1)
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'PageUp' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault()
        stepFlow(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showIntro, stepFlow])

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const t = e.touches[0]
    if (!t) return
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    const t = e.changedTouches[0]
    if (!start || !t) return

    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dy) < 56 || Math.abs(dy) < Math.abs(dx) * 1.25) return

    const scroller = centerScrollRef.current
    if (scroller && scroller.scrollHeight > scroller.clientHeight + 8) {
      const atTop = scroller.scrollTop <= 2
      const atBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
      if ((dy < 0 && !atBottom) || (dy > 0 && !atTop)) return
    }

    stepFlow(dy < 0 ? 1 : -1)
  }

  const teamLinks = normalizeLinks(team.links)
  const yOffset = shouldReduceMotion ? 0 : sceneDirection * 16

  return (
    <>
      {/* Serene Minimalist Opening */}
      {showIntro && (
        <MinimalIntro onReveal={handleIntroReveal} onComplete={handleIntroComplete} />
      )}

      {/* Scene-Reactive Soft Ambient Canvas */}
      <AmbientBackdrop activeScene={activeScene} />

      {/* SINGLE UNIFIED FULL-SCREEN SECTION */}
      <section
        aria-label={`معرفی تیم ${team.name}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 h-[100dvh] w-full overflow-hidden flex flex-col justify-between px-5 sm:px-10 py-5 sm:py-7"
      >
        {/* Minimal Top Header */}
        <motion.header
          initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
          animate={stageReady || shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.65, ease: SILK_EASE }}
          className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 shrink-0"
        >
          {/* Right: Official RASSA Symbol */}
          <button
            type="button"
            onClick={() => navigateTo('hero')}
            className="inline-flex items-center gap-2.5 text-right group cursor-pointer"
            aria-label={`بازگشت به معرفی تیم ${team.name}`}
          >
            <RasaMark className="w-8 sm:w-9 transition-transform duration-300 ease-out group-hover:scale-105" />
            <span className="font-extrabold text-sm sm:text-base text-[#0D1217] tracking-tight">
              {team.name}
            </span>
          </button>

          {/* Left: Optional Supabase Team Links + Official 8th Event Logo */}
          <div className="flex items-center gap-2.5">
            {teamLinks.length > 0 && (
              <div className="flex items-center gap-1.5">
                {teamLinks.map((link, idx) => (
                  <a
                    key={`team-link-${idx}`}
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={link.label}
                    title={link.label}
                    className="w-8 h-8 rounded-full bg-white/75 border border-[#0D1217]/[0.08] hover:border-[#008F8C]/40 flex items-center justify-center text-[#374151] hover:text-[#0D1217] transition-colors"
                  >
                    {renderLinkIcon(link.type, 14)}
                  </a>
                ))}
              </div>
            )}

            <div className="inline-flex items-center gap-2 rounded-full bg-white/75 border border-[#0D1217]/[0.075] px-3 py-1.5">
              <EventLogo
                className="w-3.5 h-5"
                alt="لوگوی هشتمین رویداد ملی تولید محتوای دیجیتال بسیج"
                tilted
              />
              <span className="text-[11px] font-semibold text-[#4B5563]">
                رویداد هشتم
              </span>
            </div>
          </div>
        </motion.header>

        {/* Center Living Stage — Everything Morphs Smoothly Right Here */}
        <main
          ref={centerScrollRef}
          className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex items-center justify-center py-4"
        >
          <AnimatePresence mode="wait" custom={sceneDirection}>
            <motion.div
              key={activeScene}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: yOffset, scale: 0.985, filter: 'blur(6px)' }
              }
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -yOffset, scale: 0.985, filter: 'blur(6px)' }
              }
              transition={{ duration: 0.36, ease: SILK_EASE }}
              className="w-full my-auto flex items-center justify-center will-change-transform"
            >
              {activeScene === 'hero' && (
                <HeroScene
                  name={team.name}
                  tagline={team.tagline}
                  loading={loading}
                  ready={stageReady}
                  onNavigate={navigateTo}
                />
              )}

              {activeScene === 'about' && (
                <AboutScene
                  teamName={team.name}
                  description={team.description}
                  loading={loading}
                />
              )}

              {activeScene === 'achievement' && (
                <AchievementScene
                  achievementText={team.achievement_text}
                  membersCount={members.length}
                  loading={loading}
                />
              )}

              {activeScene === 'members' && (
                <MembersScene
                  members={members}
                  loading={loading}
                  activeIndex={memberIndex}
                  direction={memberDirection}
                  onSelect={selectMember}
                  onStep={stepMemberWrap}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Minimal Bottom Dock + Official Registration Caption */}
        <motion.footer
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={stageReady || shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.65, delay: 0.1, ease: SILK_EASE }}
          className="w-full max-w-5xl mx-auto flex flex-col items-center gap-2.5 shrink-0"
        >
          {/* Floating Liquid Capsule Dock */}
          <nav
            aria-label="بخش‌های معرفی تیم"
            className="floating-dock inline-flex items-center gap-0.5 p-1.5 rounded-full"
          >
            {SCENES.map((scene, idx) => {
              const isActive = idx === sceneIndex
              return (
                <button
                  key={scene.key}
                  type="button"
                  onClick={() => navigateTo(scene.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-white' : 'text-[#525B66] hover:text-[#0D1217]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="scene-dock-pill"
                      transition={LIQUID_SPRING}
                      className="absolute inset-0 rounded-full bg-[#0D1217] shadow-[0_6px_18px_-4px_rgba(13,18,23,0.35)]"
                    />
                  )}
                  <span className="relative z-10">{scene.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Subtle Official Registration Line */}
          <p className="text-[11px] text-[#86919E] font-medium text-center">
            ثبت‌نام‌شده در هشتمین رویداد ملی تولید محتوای دیجیتال بسیج
          </p>
        </motion.footer>
      </section>
    </>
  )
}

export const App: React.FC = () => (
  <MotionConfig reducedMotion="user">
    <SingleStageApp />
  </MotionConfig>
)

export default App
