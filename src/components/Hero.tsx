import { ArrowLeft, BookOpen, Check, Radio } from 'lucide-react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { toPersianDigits } from '../lib/supabase'
import { useSiteMotion } from '../motion/MotionPreferences'
import type { Team } from '../types'
import { ActionLink, EVENT_NAME } from './PrintUI'
import { MotionPoster } from './poster/MotionPoster'

const TICKER_ITEMS = ['می‌رسیم', 'می‌سازیم', 'می‌درخشیم', 'تیم رَسا', 'دوره هشتم']

export function Ticker() {
  const row = TICKER_ITEMS.map((item) => <span key={item} className="ticker-item">{item}<i aria-hidden="true" /></span>)
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" dir="ltr"><span className="ticker-row">{row}</span><span className="ticker-row">{row}</span></div>
    </div>
  )
}

export function Hero({ team, count, ready }: { team: Team; count: number; ready: boolean }) {
  const { enabled: motionEnabled } = useSiteMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 120, damping: 20 })
  const py = useSpring(my, { stiffness: 120, damping: 20 })
  const facts = ['رشته نرم‌افزارهای ویژه تلفن همراه', `تیم ${toPersianDigits(count)} نفره`, 'رتبه اول دوره هفتم']
  return (
    <section
      id="home"
      className="paper hero"
      data-cued={ready}
      aria-labelledby="home-title"
      onPointerMove={(e) => {
        if (!motionEnabled || e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 16)
        my.set(((e.clientY - r.top) / r.height - 0.5) * 12)
      }}
      onPointerLeave={() => { mx.set(0); my.set(0) }}
    >
      <div className="hero-copy">
        <div className="badge-row"><span className="badge badge-red"><Radio size={14} />{EVENT_NAME}</span>
          <span className="badge badge-green"><i className="status-dot" />دوره هشتم</span></div>
        <h1 id="home-title"><span className="title-mask"><span>تیم نرم‌افزاری</span></span>{' '}
          <em className="hero-name"><span>{team.name}</span>
            <svg className="signature" viewBox="0 0 110 12" preserveAspectRatio="none" aria-hidden="true"><path d="M106 5Q78 0 55 5T4 8" pathLength="1" /></svg>
          </em>
        </h1>
        <p className="tagline">{team.tagline}</p>
        <ul className="hero-facts">{facts.map((fact) => <li key={fact}><span><Check size={11} strokeWidth={3} /></span>{fact}</li>)}</ul>
        <div className="hero-actions"><ActionLink href="#members">آشنایی با اعضای تیم <ArrowLeft size={17} /></ActionLink>
          <ActionLink href="#about" secondary><BookOpen size={16} />درباره {team.name}</ActionLink></div>
      </div>
      <motion.div style={motionEnabled ? { x: px, y: py } : undefined}>
        <MotionPoster ready={ready} />
      </motion.div>
    </section>
  )
}
