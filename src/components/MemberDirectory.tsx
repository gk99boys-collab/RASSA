import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Contact, Database, Fingerprint, Layers2, LockKeyhole, Mic, Smartphone, UserRound, UsersRound } from 'lucide-react'
import { formatOrderBadge, isMysteryMember, resolveMemberPhotoUrl, toPersianDigits } from '../lib/supabase'
import { tabKeys } from '../lib/tabKeys'
import type { Member } from '../types'
import { DataLinks, Reveal, SectionTitle, Skeleton, SPRING } from './PrintUI'

const ICONS = [BriefcaseBusiness, Smartphone, Database, Mic]
const MOBILE_LIST = '(max-width: 700px)'

function locked(member: Member) {
  // The fifth seat opens on a name edit alone, even if old links metadata had a lock flag.
  return isMysteryMember(member.sort_order === 5 ? { ...member, links: null } : member)
}

function Portrait({ member }: { member: Member }) {
  const src = resolveMemberPhotoUrl(member.photo_url)
  const [failed, setFailed] = useState<string | null>(null)
  const initials = member.name.trim().replace(/^سید\s+/, '').split(/\s+/).filter(Boolean)
    .filter((_, i, parts) => i === 0 || i === parts.length - 1).map((part) => part[0]).join('‌')
  return <div className={`portrait tone-${(member.sort_order - 1) % 4}`}>
    {src && src !== failed ? <img src={src} alt={member.name} decoding="async" loading="lazy" onError={() => setFailed(src)} /> :
      <><strong aria-hidden="true">{initials}</strong><span aria-hidden="true" dir="ltr" className="portrait-id mono"># {formatOrderBadge(member.sort_order)}</span></>}
  </div>
}

function MemberProfile({ member, loading }: { member: Member; loading: boolean }) {
  if (locked(member)) return (
    <Reveal className="locked-profile"><div className="lock-print" aria-hidden="true"><LockKeyhole size={30} strokeWidth={1.6} /></div>
      <span className="badge mystery-badge">در انتظار معرفی</span><h3>{member.name}</h3><p>{member.bio}</p></Reveal>
  )
  return (
    <Reveal className="profile-body">
      <div className="member-intro"><Portrait member={member} /><div className="member-identity">
        <span className="member-eyebrow"><i />عضو شماره {formatOrderBadge(member.sort_order)}</span>
        <h3>{member.name}</h3><span className="badge badge-green"><i className="status-dot" />{member.role}</span>
      </div></div>
      {loading ? <Skeleton label="در حال دریافت مشخصات عضو" /> : <>
        <p className="bio">{member.bio}</p>
        {member.skills.length > 0 && <div className="skills"><h4><Layers2 size={15} />مهارت‌ها</h4>
          <ul>{member.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>}
        <DataLinks links={member.links} label={`پیوندهای ${member.name}`} />
      </>}
    </Reveal>
  )
}

export function MemberDirectory({ members, loading, teamName }: { members: Member[]; loading: boolean; teamName: string }) {
  const [seat, setSeat] = useState<number | null>(null)
  const [compact, setCompact] = useState(() => window.matchMedia(MOBILE_LIST).matches)
  const list = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const index = Math.max(0, members.findIndex((member) => member.sort_order === seat))
  const member = members[index]
  const select = (i: number) => setSeat(members[i].sort_order)

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
    if (item) list.current.scrollBy({ left: Math.min(item.left - view.left, 0) + Math.max(item.right - view.right, 0), behavior: reduced ? 'instant' : 'smooth' })
  }, [compact, index, reduced])

  if (!member) return null
  return (
    <section id="members" className="page-section" aria-labelledby="members-title">
      <SectionTitle id="members-title" label="اعضا" title={`اعضای تیم ${teamName}`} meta={<><UsersRound size={14} />{toPersianDigits(members.length)} عضو</>} />
      <div className="directory">
        <div ref={list} className="roster" role="tablist" aria-label="فهرست اعضای تیم" aria-orientation={compact ? 'horizontal' : 'vertical'}>
          {members.map((item, i) => {
            const mystery = locked(item)
            const Icon = mystery ? LockKeyhole : ICONS[item.sort_order - 1] || UserRound
            return <button className={`member-tab ${mystery ? 'mystery-tab' : ''}`} type="button" key={item.sort_order}
              role="tab" id={`seat-${item.sort_order}`} aria-selected={index === i} aria-controls="member-profile"
              tabIndex={index === i ? 0 : -1} onClick={() => select(i)} onKeyDown={(e) => tabKeys(e, i, members.length, select, !compact)}>
              {i === index && <motion.span className="roster-selection" aria-hidden="true" layoutId={reduced ? undefined : 'selected-member'} transition={SPRING} />}
              <span className="member-icon"><Icon size={19} strokeWidth={1.8} /></span>
              <span className="member-label"><strong>{item.name}</strong><small>{item.role}</small></span><ChevronLeft size={16} className="list-chevron" />
            </button>
          })}
        </div>
        <div className="paper profile" id="member-profile" role="tabpanel" tabIndex={0} aria-busy={loading} aria-labelledby={`seat-${member.sort_order}`}>
          <div className="profile-bar"><span><Contact size={16} />شناسنامه عضو</span>
            <div className="profile-controls">
              <button type="button" aria-label="عضو قبلی" onClick={() => select((index - 1 + members.length) % members.length)}><ChevronRight size={15} /></button>
              <span className="page-index" dir="ltr">{formatOrderBadge(index + 1)} <b>/</b> {formatOrderBadge(members.length)}</span>
              <button type="button" aria-label="عضو بعدی" onClick={() => select((index + 1) % members.length)}><ChevronLeft size={15} /></button>
            </div>
          </div>
          <MemberProfile key={member.id} member={member} loading={loading} />
          <div className="profile-foot" aria-hidden="true"><Fingerprint size={19} strokeWidth={1.4} />
            <span className="mono" dir="ltr">RASSA / {formatOrderBadge(member.sort_order)}</span></div>
        </div>
      </div>
    </section>
  )
}
