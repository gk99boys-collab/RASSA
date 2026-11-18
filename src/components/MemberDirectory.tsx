import { useSiteMotion } from '../motion/MotionPreferences'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useIsPresent, type Variants } from 'framer-motion'
import { ArrowDown, ChevronLeft, ChevronRight, Contact, UsersRound } from 'lucide-react'
import { formatOrderBadge, toPersianDigits } from '../lib/supabase'
import { tabKeys } from '../lib/tabKeys'
import type { Member } from '../types'
import { EASE, SectionTitle, SPRING } from './PrintUI'
import { MemberCard, Portrait } from './members/MemberCard'
import { artwork, cardDesign } from './members/studios'
import { useMemberJourney } from '../motion/useMemberJourney'

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
  const onStop = useCallback((i: number) => {
    const seat = members[i].sort_order
    setSelection(old => old.seat === seat ? old : { seat, dir: seat >= (old.seat ?? seat) ? 1 : -1 })
  }, [members])
  const { track, stage, jump } = useMemberJourney(members.length, enabled, onStop)
  function select(i: number, dir = i > index ? 1 : -1) {
    if (i !== index) { jump(i); setSelection({ seat: members[i].sort_order, dir }) }
  }

  useEffect(() => {
    const media = window.matchMedia(MOBILE_LIST)
    const change = () => setCompact(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  // Keep the chosen tab visible without scrolling the whole document.
  useEffect(() => {
    if (!list.current) return
    const item = list.current.querySelector('[aria-selected="true"]')?.getBoundingClientRect()
    const view = list.current.getBoundingClientRect()
    if (item) list.current.scrollBy({ left: compact ? Math.min(item.left - view.left, 0) + Math.max(item.right - view.right, 0) : 0,
      top: compact ? 0 : Math.min(item.top - view.top, 0) + Math.max(item.bottom - view.bottom, 0), behavior: enabled ? 'smooth' : 'instant' })
  }, [compact, index, enabled])

  if (!member) return <section id="members" className="page-section paper empty-roster"><h2>اعضای تیم {teamName}</h2><p>هنوز عضوی معرفی نشده است.</p></section>
  return (
    <section ref={track} id="members" className="page-section member-scene" aria-labelledby="members-title">
      <div ref={stage} className="member-stage">
        <SectionTitle id="members-title" label="اعضا" title={`اعضای تیم ${teamName}`} meta={<><UsersRound size={14} />{toPersianDigits(members.length)} عضو</>} />
        <div className="directory">
          <div ref={list} className="roster" data-long={members.length > 5} data-printed={listPrinted} role="tablist" aria-label="فهرست اعضای تیم" aria-orientation={compact ? 'horizontal' : 'vertical'}>
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
            <div className="profile-foot"><span className="journey-caption"><i />با اسکرول، کارت‌ها را ورق بزنید</span>
              <span className="manual-caption">پروندهٔ {formatOrderBadge(member.sort_order)}</span>
              <a className="journey-skip" href="#honors">عبور از اعضا <ArrowDown size={13} /></a></div>
          </div>
        </div>
      </div>
    </section>
  )
}
