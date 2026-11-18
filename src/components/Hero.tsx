import { ArrowLeft, BookOpen, Check, Radio } from 'lucide-react'
import { toPersianDigits } from '../lib/supabase'
import type { Team } from '../types'
import { ActionLink, EVENT_NAME } from './PrintUI'
import { MotionPoster } from './poster/MotionPoster'

export function Hero({ team, count, ready }: { team: Team; count: number; ready: boolean }) {
  const facts = ['رشته نرم‌افزارهای ویژه تلفن همراه', `تیم ${toPersianDigits(count)} نفره`, 'رتبه اول دوره هفتم']
  return (
    <section id="home" className="paper hero" data-cued={ready} aria-labelledby="home-title">
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
      <MotionPoster ready={ready} />
    </section>
  )
}
