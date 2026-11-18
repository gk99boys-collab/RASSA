import { useSiteMotion } from '../motion/MotionPreferences'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useIsPresent, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight, Contact, Fingerprint, UsersRound } from 'lucide-react'
import { formatOrderBadge, toPersianDigits } from '../lib/supabase'
import { tabKeys } from '../lib/tabKeys'
import type { Member } from '../types'
import { EASE, SectionTitle, SPRING } from './PrintUI'
import { MemberCard, Portrait } from './members/MemberCard'
import { artwork, cardDesign } from './members/studios'

const MOBILE_LIST = '(max-width: 700px)'

const sheet: Variants = {
  enter: (dir: number) => ({ x: -dir * 36, y: 5, rotateY: dir * 12, rotate: -dir * 1.1, opacity: .32 }),
  read: { x: 0, y: 0, rotateY: 0, rotate: 0, opacity: 1, transition: { ...SPRING, opacity: { duration: .2 } } },
  leave: (dir: number) => ({ x: dir * 25, rotateY: -dir * 8, opacity: 0, transition: { duration: .16, ease: EASE } }),
}

function FileLeaf({ member, loading, direction }: { member: Member; loading: boolean; direction: number }) {
  const present = useIsPresent()
  return <motion.div className="file-leaf" variants={sheet} initial="enter" animate="read" exit="leave" custom={direction}
    aria-hidden={present ? undefined : true} inert={!present} style={{ originX: direction > 0 ? 1 : 0 }}>
    <MemberCard member={member} loading={loading} />
  </motion.div>
}

export function MemberDirectory({ members, loading, teamName }: { members: Member[]; loading: boolean; teamName: string }) {
  const [selection, setSelection] = useState<{ seat: number | null; dir: number }>({ seat: null, dir: 1 })
  const [compact, setCompact] = useState(() => window.matchMedia(MOBILE_LIST).matches)
  const list = useRef<HTMLDivElement>(null)
  const listPrinted = useInView(list, { once: true, amount: .15 })
  const { enabled } = useSiteMotion()
  const index = Math.max(0, members.findIndex((member) => member.sort_order === selection.seat))
  const member = members[index]
  function select(i: number, dir = i > index ? 1 : -1) {
    if (i !== index) setSelection({ seat: members[i].sort_order, dir })
  }

  useEffect(() => {
    const media = window.matchMedia(MOBILE_LIST)
    const change = () => setCompact(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  // Keep the chosen card in the mobile strip without scrolling the whole document.
  useEffect(() => {
    if (!compact || !list.current) return
    const item = list.current.querySelector('[aria-selected="true"]')?.getBoundingClientRect()
    const view = list.current.getBoundingClientRect()
    if (item) list.current.scrollBy({ left: Math.min(item.left - view.left, 0) + Math.max(item.right - view.right, 0), behavior: enabled ? 'smooth' : 'instant' })
  }, [compact, index, enabled])

  if (!member) return null
  return (
    <section id="members" className="page-section" aria-labelledby="members-title">
      <SectionTitle id="members-title" label="اعضا" title={`اعضای تیم ${teamName}`} meta={<><UsersRound size={14} />{toPersianDigits(members.length)} عضو</>} />
      <div className="directory">
        <div ref={list} className="roster" data-printed={listPrinted} role="tablist" aria-label="فهرست اعضای تیم" aria-orientation={compact ? 'horizontal' : 'vertical'}>
          {members.map((item, i) => {
            const { studio, sealed } = cardDesign(item)
            return <button className="member-tab" data-studio={studio} type="button" key={item.sort_order}
              role="tab" id={`seat-${item.sort_order}`} aria-selected={index === i} aria-controls="member-profile"
              tabIndex={index === i ? 0 : -1} onClick={() => select(i)} onKeyDown={(e) => tabKeys(e, i, members.length, select, !compact)}>
              {i === index && <motion.span className="roster-selection" aria-hidden="true" layoutId={!enabled ? undefined : 'selected-member'} transition={SPRING} />}
              <Portrait member={item} sealed={sealed} mini />
              <span className="member-label"><strong>{item.name}</strong><small>{item.role}</small></span>
              <span className="proof-thumb" aria-hidden="true"><img src={artwork(studio, 'thumb')} width={192} height={192} alt="" loading="lazy" decoding="async" />
                <span>{formatOrderBadge(item.sort_order)}</span></span>
            </button>
          })}
        </div>
        <div className="paper profile" id="member-profile" role="tabpanel" tabIndex={0} aria-busy={loading} aria-labelledby={`seat-${member.sort_order}`}>
          <div className="profile-bar"><span><Contact size={16} />شناسنامه عضو</span>
            <div className="profile-controls">
              <button type="button" aria-label="عضو قبلی" onClick={() => select((index - 1 + members.length) % members.length, -1)}><ChevronRight size={15} /></button>
              <span className="page-index" dir="ltr">{formatOrderBadge(index + 1)} <b>/</b> {formatOrderBadge(members.length)}</span>
              <button type="button" aria-label="عضو بعدی" onClick={() => select((index + 1) % members.length, 1)}><ChevronLeft size={15} /></button>
            </div>
          </div>
          <div className="file-deck">{enabled
            ? <AnimatePresence initial={false} custom={selection.dir}>
              <FileLeaf key={member.id} member={member} loading={loading} direction={selection.dir} />
            </AnimatePresence>
            : <MemberCard key={member.id} member={member} loading={loading} />}
          </div>
          <div className="profile-foot" aria-hidden="true"><Fingerprint size={19} strokeWidth={1.4} />
            <span className="mono" dir="ltr">RASSA / {formatOrderBadge(member.sort_order)}</span></div>
        </div>
      </div>
    </section>
  )
}
