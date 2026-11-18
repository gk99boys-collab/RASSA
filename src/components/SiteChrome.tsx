import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, ChevronLeft, ExternalLink, Home, Menu, UsersRound, X } from 'lucide-react'
import type { Team } from '../types'
import { EventLogo, RasaLogo, RasaMark } from './BrandMarks'
import { ActionLink, DataLinks, EVENT_NAME, EVENT_URL, SPRING } from './PrintUI'

const SECTIONS = [
  { id: 'home', label: 'صفحه اصلی' }, { id: 'about', label: 'درباره تیم' },
  { id: 'members', label: 'اعضای تیم' }, { id: 'honors', label: 'افتخارات' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function useCurrentSection() {
  const [active, setActive] = useState<SectionId>('home')
  useEffect(() => {
    // A reading line below the sticky masthead; ordinary scrolling, anchors and
    // browser history all drive the same nav indicator without hijacking gestures.
    const sections = SECTIONS.map(({ id }) => document.getElementById(id)).filter((el) => el !== null)
    const observer = new IntersectionObserver(() => {
      const line = window.innerHeight * 0.3
      const current = sections.filter((el) => el.getBoundingClientRect().top <= line).at(-1)
      setActive((current?.id as SectionId) || 'home')
    }, { rootMargin: '0px 0px -70% 0px' })
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return active
}

export function SiteHeader({ name }: { name: string }) {
  const active = useCurrentSection()
  const reduced = useReducedMotion()
  const [menu, setMenu] = useState(false)
  const header = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!menu) return
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenu(false); trigger.current?.focus() }
    }
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setMenu(false)
    }
    document.addEventListener('keydown', key)
    document.addEventListener('pointerdown', outside)
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside) }
  }, [menu])
  return (
    <header className="masthead" ref={header}>
      <div className="page-width masthead-inner">
        <button type="button" className="menu-button" aria-label={menu ? 'بستن فهرست' : 'فهرست بخش‌ها'}
          ref={trigger} aria-controls="site-nav" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          {menu ? <X size={19} /> : <Menu size={19} />}
        </button>
        <a className="brand" href="#home" onClick={() => setMenu(false)}>
          <RasaMark className="brand-mark" /><span className="brand-text"><strong>تیم نرم‌افزاری {name}</strong>
          <small dir="ltr" lang="en" className="mono">RASSA SOFTWARE TEAM</small></span>
        </a>
        <nav id="site-nav" aria-label="ناوبری اصلی" className={`main-nav ${menu ? 'nav-open' : ''}`}>
          {SECTIONS.map(({ id, label }) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}
            aria-current={id === active ? 'location' : undefined}>
            {label}{id === active && <motion.span aria-hidden="true" className="nav-underline"
              layoutId={reduced ? undefined : 'current-section'} transition={SPRING} />}
          </a>)}
        </nav>
        <div className="masthead-actions">
          <a className="event-link" href={EVENT_URL} target="_blank" rel="noopener noreferrer" aria-label={`وب‌سایت ${EVENT_NAME}`}>
            <EventLogo className="masthead-event" />
          </a>
          <ActionLink href="#members" className="header-cta"><UsersRound size={16} />اعضای تیم</ActionLink>
        </div>
      </div>
    </header>
  )
}

export function PageCaption() {
  return <div className="page-caption">
    <span className="breadcrumbs"><Home size={13} /><a href="#home">صفحه اصلی</a><ChevronLeft size={12} /><strong>معرفی تیم</strong></span>
    <span className="print-id mono" dir="ltr" lang="en"><i aria-hidden="true" />RASSA <b>/</b> TEAM PROFILE</span>
  </div>
}

export function SiteFooter({ team }: { team: Team }) {
  return (
    <footer className="site-footer">
      <div className="page-width footer-main">
        <div className="footer-identity">
          <RasaLogo className="footer-logo" /><span className="footer-divider" /><EventLogo className="footer-event" alt="نشان رویداد هشتم" />
        </div>
        <div className="footer-copy"><strong>تیم نرم‌افزاری {team.name}</strong>
          <p>ثبت‌نام‌شده در هشتمین رویداد ملی تولید محتوای دیجیتال بسیج</p>
          <DataLinks links={team.links} label="پیوندهای تیم" />
        </div>
        <div className="footer-utilities"><span className="badge badge-green"><i className="status-dot" />دوره هشتم</span>
          <a href="#home" className="back-top" aria-label="بازگشت به بالای صفحه"><ArrowUp size={17} /></a>
        </div>
      </div>
      <div className="page-width footer-bottom"><a href={EVENT_URL} target="_blank" rel="noopener noreferrer">وب‌سایت رسمی رویداد <ExternalLink size={12} /></a>
        <span className="mono" dir="ltr" lang="en">RASSA <b>/</b> SOFTWARE TEAM</span>
      </div>
    </footer>
  )
}
