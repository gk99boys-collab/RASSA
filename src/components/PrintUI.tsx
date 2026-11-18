import { useSiteMotion } from '../motion/MotionPreferences'
import { motion } from 'framer-motion'
import { ArrowUpLeft, Globe, Link2, Mail, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { normalizeLinks } from '../lib/supabase'
import type { RawLinks } from '../types'

export const EASE = [0.16, 1, 0.3, 1] as const
export const SPRING = { type: 'spring', stiffness: 350, damping: 34, mass: 0.82 } as const
export const EVENT_NAME = 'هشتمین رویداد ملی تولید محتوای دیجیتال بسیج'
export const EVENT_URL = 'https://event.bsjmajazi.ir/'

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { enabled } = useSiteMotion()
  return (
    <motion.div className={className} initial={false} viewport={{ once: true, amount: .1 }}
      whileInView={!enabled ? undefined : { opacity: [.45, 1], y: [7, 0], filter: ['blur(1.5px)', 'blur(0px)'], transitionEnd: { filter: 'none' } }}
      transition={{ duration: .42, ease: EASE }}>
      {children}
    </motion.div>
  )
}

export function ActionLink({ href, children, secondary = false, className = '' }: {
  href: string; children: ReactNode; secondary?: boolean; className?: string
}) {
  const { enabled } = useSiteMotion()
  return (
    <motion.a href={href} className={`action ${secondary ? 'action-paper' : 'action-red'} ${className}`}
      whileTap={!enabled ? undefined : { x: 2, y: 2, scale: 0.985 }} transition={SPRING}>
      {children}
    </motion.a>
  )
}

export function DataLinks({ links, label }: { links: RawLinks; label: string }) {
  const items = normalizeLinks(links)
  if (!items.length) return null
  return (
    <ul className="data-links" aria-label={label}>
      {items.map(({ url, type, label: text }, index) => {
        const Icon = type === 'email' ? Mail : type === 'phone' ? Phone : type === 'website' ? Globe : Link2
        const external = /^https?:/i.test(url)
        return <li key={`${url}-${index}`}><a href={url} target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}>
          <Icon size={14} aria-hidden="true" />{text}{external && <ArrowUpLeft size={13} aria-hidden="true" />}
        </a></li>
      })}
    </ul>
  )
}

export function SectionTitle({ id, label, title, meta, red = false }: {
  id: string; label: string; title: string; meta: ReactNode; red?: boolean
}) {
  return (
    <div className="section-title">
      <span className={`flag ${red ? 'flag-red' : 'flag-ink'}`}>{label}</span>
      <h2 id={id}>{title}</h2><span className="title-rule" aria-hidden="true" />
      <span className="section-meta">{meta}</span>
    </div>
  )
}

export function Skeleton({ label }: { label: string }) {
  return <div className="skeleton" role="status" aria-label={label}><i /><i /><i /></div>
}
