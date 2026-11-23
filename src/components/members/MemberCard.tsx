import { useState } from 'react'
import { Briefcase, GraduationCap, Layers2, LockKeyhole } from 'lucide-react'
import { formatOrderBadge, resolveMemberPhotoUrl } from '../../lib/supabase'
import type { Member } from '../../types'
import { mediaUrl } from '../../lib/memberMedia'
import { DataLinks, Skeleton } from '../PrintUI'
import { artwork, cardDesign, STUDIOS, type Studio } from './studios'

export function Portrait({ member, sealed, mini = false }: { member: Member; sealed: boolean; mini?: boolean }) {
  const [failed, setFailed] = useState<string[]>([])
  const uploaded = sealed ? null : mediaUrl(member.media?.portrait_path)
  const src = sealed ? null : [uploaded, resolveMemberPhotoUrl(member.photo_url)]
    .find(url => url && !failed.includes(url))
  const initials = member.name.trim().replace(/^سید\s+/, '').split(/\s+/).filter(Boolean)
    .filter((_, i, words) => i === 0 || i === words.length - 1).map(word => word[0]).join('‌')
  return <span className={`portrait${mini ? ' portrait-mini' : ''}${sealed ? ' lock-print' : ''}`}
    aria-hidden={mini || !src ? true : undefined}>
    {sealed ? <LockKeyhole size={mini ? 18 : 28} strokeWidth={1.7} />
      : src ? <img className={src === uploaded ? 'uploaded-portrait' : undefined} src={src} alt={mini ? '' : member.name} loading="lazy" decoding="async" onError={() => setFailed(old => [...old, src])} />
      : <><strong>{initials || '—'}</strong>{!mini && <span className="portrait-id mono" dir="ltr"># {formatOrderBadge(member.sort_order)}</span>}</>}
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
    <span className="studio-ghost mono" aria-hidden="true" dir="ltr">{formatOrderBadge(member.sort_order)}</span>
    {!custom && <div className="studio-lettering"><span className="studio-kicker"><i />تصویرسازی کارگاه</span>
      <p>{top} <b>{bottom}</b></p></div>}
    <span className="studio-shine" aria-hidden="true" />
  </header>
}

export function MemberCard({ member, loading }: { member: Member; loading: boolean }) {
  const { studio, sealed } = cardDesign(member)
  const facts = !sealed && (member.education || member.experience)
  return <article className="member-sheet" data-studio={studio}>
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
          <ul>{member.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>}
        {!sealed && <DataLinks links={member.links} label={`پیوندهای ${member.name}`} />}
      </>}
    </div>
  </article>
}
