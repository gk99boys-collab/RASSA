import { useRef, useState, type PointerEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import {
  Briefcase, Calculator, Camera, Check, Code, Database, Globe, GraduationCap, Layers2,
  LockKeyhole, Palette, PenLine, PenTool, Presentation, QrCode, Scissors, Server, Share2, Target,
} from 'lucide-react'
import { formatOrderBadge, resolveMemberPhotoUrl } from '../../lib/supabase'
import type { Member } from '../../types'
import { mediaUrl } from '../../lib/memberMedia'
import { useSiteMotion } from '../../motion/MotionPreferences'
import { DataLinks, Skeleton } from '../PrintUI'
import { artwork, cardDesign, STUDIOS, type Studio } from './studios'

function skillIcon(skill: string) {
  if (/فرانت‌اند|فرانت/.test(skill)) return Code
  if (/گرافیک/.test(skill)) return Palette
  if (/وب‌سایت|وب/.test(skill)) return Globe
  if (/مدیریت پروژه/.test(skill)) return Target
  if (/عکاسی/.test(skill)) return Camera
  if (/سناریو/.test(skill)) return PenLine
  if (/ادیتور/.test(skill)) return Scissors
  if (/بک‌اند/.test(skill)) return Server
  if (/پشتیبان/.test(skill)) return Database
  if (/حسابداری/.test(skill)) return Calculator
  if (/تولید محتوا/.test(skill)) return PenTool
  if (/ارائه/.test(skill)) return Presentation
  return Layers2
}

export function Portrait({ member, sealed, mini = false }: { member: Member; sealed: boolean; mini?: boolean }) {
  const [failed, setFailed] = useState<string[]>([])
  const uploaded = sealed ? null : mediaUrl(member.media?.portrait_path)
  const src = sealed ? null : [uploaded, resolveMemberPhotoUrl(member.photo_url)]
    .find(url => url && !failed.includes(url))
  const initials = member.name.trim().replace(/^سید\s+/, '').split(/\s+/).filter(Boolean)
    .filter((_, i, words) => i === 0 || i === words.length - 1).map(word => word[0]).join('‌')
  // Short "۵ سال سابقه" caption for the photo strip; full text stays in the facts.
  const badge = !mini && !sealed ? member.experience?.match(/^(.+?سابقه)/)?.[1] : undefined
  return <span className={`portrait${mini ? ' portrait-mini' : ''}${sealed ? ' lock-print' : ''}`}
    aria-hidden={mini || !src ? true : undefined}>
    {sealed ? <LockKeyhole size={mini ? 18 : 28} strokeWidth={1.7} />
      : src ? <img className={src === uploaded ? 'uploaded-portrait' : undefined} src={src} alt={mini ? '' : member.name} loading="lazy" decoding="async" onError={() => setFailed(old => [...old, src])} />
      : <><strong>{initials || '—'}</strong>{!mini && <span className="portrait-id mono" dir="ltr"># {formatOrderBadge(member.sort_order)}</span>}</>}
    {badge && <span className="portrait-badge"><Briefcase size={11} aria-hidden="true" />{badge}</span>}
  </span>
}

// A sealed seat doesn't even request its uploaded art. Broken overrides fall
// back to the existing responsive role illustrations and their smaller proofs.
function useCover(member: Member, sealed: boolean) {
  const [failed, setFailed] = useState<string | null>(null)
  const url = sealed ? null : mediaUrl(member.media?.cover_path)
  const custom = url && url !== failed ? url : null
  return { custom, onError: custom ? () => setFailed(custom) : undefined }
}

type ArtProps = { member: Member; studio: Studio; sealed: boolean }
export function CoverThumb({ member, studio, sealed }: ArtProps) {
  const { custom, onError } = useCover(member, sealed)
  return <img src={custom ?? artwork(studio, 'thumb')} width={192} height={192} alt="" loading="lazy" decoding="async" onError={onError} />
}

function StudioHeader({ member, studio, sealed }: ArtProps) {
  const { custom, onError } = useCover(member, sealed)
  const [top, bottom] = sealed ? ['فصل', 'بعد'] : STUDIOS[studio].title
  return <header className="studio-header">
    <img className="studio-illustration" src={custom ?? artwork(studio, 756)}
      srcSet={custom ? undefined : `${artwork(studio, 756)} 756w, ${artwork(studio, 1404)} 1404w`}
      sizes={custom ? undefined : '(max-width: 700px) calc(100vw - 32px), (max-width: 1400px) 63vw, 860px'}
      width={1404} height={520} loading="lazy" decoding="async" onError={onError} alt={custom ? `تصویر اختصاصی کارت ${member.name}` : STUDIOS[studio].alt} />
    <span className="studio-shade" aria-hidden="true" />
    <span className="studio-stripes" aria-hidden="true" />
    <span className="studio-ghost mono" aria-hidden="true" dir="ltr">{formatOrderBadge(member.sort_order)}</span>
    {!custom && <div className="studio-lettering"><span className="studio-kicker"><i />تصویرسازی کارگاه</span>
      <p>{top} <b>{bottom}</b></p></div>}
    <span className="studio-stamp" aria-hidden="true">تیم رَسا</span>
    <span className="spark spark-a" aria-hidden="true" />
    <span className="spark spark-b" aria-hidden="true" />
    <span className="spark spark-c" aria-hidden="true" />
    <span className="studio-shine" aria-hidden="true" />
  </header>
}

export function MemberCard({ member, loading }: { member: Member; loading: boolean }) {
  const { studio, sealed } = cardDesign(member)
  const facts = !sealed && (member.education || member.experience)
  const { enabled } = useSiteMotion()
  const sheet = useRef<HTMLElement>(null)
  const tiltX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: .6 })
  const tiltY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: .6 })

  // Pointer-tracked 3D tilt + glare. Mouse only; quiet mode and touch stay flat.
  function track(e: PointerEvent<HTMLElement>) {
    if (!enabled || e.pointerType !== 'mouse' || !sheet.current) return
    const box = sheet.current.getBoundingClientRect()
    const px = (e.clientX - box.left) / box.width
    const py = (e.clientY - box.top) / box.height
    tiltY.set((px - .5) * 7)
    tiltX.set((.5 - py) * 7)
    sheet.current.style.setProperty('--mx', `${px * 100}%`)
    sheet.current.style.setProperty('--my', `${py * 100}%`)
  }
  function settle() { tiltX.set(0); tiltY.set(0) }

  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}${window.location.pathname}?member=${member.sort_order}#members`
  const qrTarget = (Array.isArray(member.links) ? member.links[0]?.url : undefined) || shareUrl
  function copyCardLink() {
    navigator.clipboard?.writeText(shareUrl).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }
  return <motion.article ref={sheet} className="member-sheet" data-studio={studio}
    onPointerMove={track} onPointerLeave={settle} onPointerCancel={settle}
    style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100 }}>
    <StudioHeader member={member} studio={studio} sealed={sealed} />
    <div className={`profile-body${sealed ? ' locked-profile' : ''}`}>
      <div className="member-intro">
        <Portrait member={member} sealed={sealed} />
        <div className="member-identity">
          <span className="member-eyebrow"><i />عضو شماره {formatOrderBadge(member.sort_order)}</span>
          <h3>{member.name}</h3>
          <span className="member-role">{sealed ? 'در انتظار معرفی' : member.role}</span>
          {facts && <ul className="member-facts">
            {member.education && <li><GraduationCap size={13} aria-hidden="true" />{member.education}</li>}
            {member.experience && <li><Briefcase size={13} aria-hidden="true" />{member.experience}</li>}
          </ul>}
        </div>
      </div>
      {loading && !sealed ? <Skeleton label="در حال دریافت مشخصات عضو" /> : <>
        <p className="bio">{member.bio}</p>
        {!sealed && member.skills.length > 0 && <div className="skills"><h4><Layers2 size={15} />مهارت‌ها</h4>
          <ul>{member.skills.map(skill => { const Icon = skillIcon(skill); return <li key={skill}><Icon size={13} aria-hidden="true" />{skill}</li> })}</ul></div>}
        {!sealed && <div className="member-actions">
          <DataLinks links={member.links} label={`پیوندهای ${member.name}`} />
          <button type="button" className="share-btn" onClick={copyCardLink}>
            {copied ? <><Check size={14} />کپی شد!</> : <><Share2 size={14} />کپی لینک کارت</>}
          </button>
          <a className="qr-chip" href={qrTarget} target="_blank" rel="noreferrer" title="اسکن یا باز کردن لینک">
            <QrCode size={16} aria-hidden="true" /><span>QR</span>
          </a>
        </div>}
      </>}
    </div>
    <span className="member-glare" aria-hidden="true" />
  </motion.article>
}
