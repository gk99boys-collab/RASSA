import { ArrowLeft, BookOpen, Check, Radio } from 'lucide-react'
import { toPersianDigits } from '../lib/supabase'
import type { Team } from '../types'
import { EventLogo, RasaLogo } from './BrandMarks'
import { ActionLink, EVENT_NAME, Reveal } from './PrintUI'

/** A typeset poster, not a screenshot: scalable lettering, print marks and both original PNGs. */
function EventPoster() {
  return (
    <figure className="poster" aria-label="پوستر تیم رَسا در هشتمین رویداد ملی تولید محتوای دیجیتال بسیج">
      <div className="poster-art">
        <span className="poster-edition mono" aria-hidden="true" dir="ltr">NATIONAL DIGITAL EVENT</span>
        <span className="poster-eight" aria-hidden="true" dir="ltr">08</span>
        <i aria-hidden="true" className="reg-mark reg-tl" /><i aria-hidden="true" className="reg-mark reg-tr" />
        <i aria-hidden="true" className="reg-mark reg-bl" /><i aria-hidden="true" className="reg-mark reg-br" />
        <div className="poster-type" aria-hidden="true">
          <span className="poster-kicker">دوره هشتم</span>
          <strong>رویداد ملی<br />تولید محتوای<br />دیجیتال بسیج</strong>
        </div>
        <div className="cursor-print"><EventLogo className="poster-cursor" alt="نشان پیکسلی رویداد هشتم" /></div>
        <div className="poster-stamp"><RasaLogo className="stamp-logo" /></div>
        <span className="poster-code mono" aria-hidden="true" dir="ltr">RASSA × EVENT 08</span>
      </div>
      <figcaption><span><i aria-hidden="true" />پوستر رویداد هشتم</span><span className="poster-serial mono" dir="ltr" aria-hidden="true"><i className="barcode" />FIG. 08</span></figcaption>
    </figure>
  )
}

export function Hero({ team, count }: { team: Team; count: number }) {
  const facts = ['رشته نرم‌افزارهای ویژه تلفن همراه', `تیم ${toPersianDigits(count)} نفره`, 'رتبه اول دوره هفتم']
  return (
    <section id="home" className="paper hero" aria-labelledby="home-title">
      <Reveal className="hero-copy">
        <div className="badge-row"><span className="badge badge-red"><Radio size={14} />{EVENT_NAME}</span>
          <span className="badge badge-green"><i className="status-dot" />دوره هشتم</span></div>
        <h1 id="home-title">تیم نرم‌افزاری <em>{team.name}</em></h1>
        <p className="tagline">{team.tagline}</p>
        <ul className="hero-facts">{facts.map((fact) => <li key={fact}><span><Check size={11} strokeWidth={3} /></span>{fact}</li>)}</ul>
        <div className="hero-actions"><ActionLink href="#members">آشنایی با اعضای تیم <ArrowLeft size={17} /></ActionLink>
          <ActionLink href="#about" secondary><BookOpen size={16} />درباره {team.name}</ActionLink></div>
      </Reveal>
      <EventPoster />
    </section>
  )
}
