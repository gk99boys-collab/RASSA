import { useState } from 'react'
import { Layers2, LockKeyhole } from 'lucide-react'
import { formatOrderBadge, resolveMemberPhotoUrl } from '../../lib/supabase'
import type { Member } from '../../types'
import { DataLinks, Skeleton } from '../PrintUI'
import { artwork, cardDesign, STUDIOS, type Studio } from './studios'

export function Portrait({ member, sealed, mini = false }: { member: Member; sealed: boolean; mini?: boolean }) {
  const src = sealed ? null : resolveMemberPhotoUrl(member.photo_url)
  const [failed, setFailed] = useState<string | null>(null)
  const showPhoto = !!src && src !== failed
  const initials = member.name.trim().replace(/^سید\s+/, '').split(/\s+/).filter(Boolean)
    .filter((_, i, words) => i === 0 || i === words.length - 1).map(word => word[0]).join('‌')
  return <span className={`portrait${mini ? ' portrait-mini' : ''}${sealed ? ' lock-print' : ''}`}
    aria-hidden={mini || !showPhoto ? true : undefined}>
    {sealed ? <LockKeyhole size={mini ? 18 : 28} strokeWidth={1.7} />
      : showPhoto ? <img src={src} alt={mini ? '' : member.name} loading="lazy" decoding="async" onError={() => setFailed(src)} />
      : <><strong>{initials || '—'}</strong>{!mini && <span className="portrait-id mono" dir="ltr"># {formatOrderBadge(member.sort_order)}</span>}</>}
  </span>
}

function StudioHeader({ studio, sealed }: { studio: Studio; sealed: boolean }) {
  const [top, bottom] = sealed ? ['فصل', 'بعد'] : STUDIOS[studio].title
  return <header className="studio-header">
    <img className="studio-illustration" src={artwork(studio, 756)}
      srcSet={`${artwork(studio, 756)} 756w, ${artwork(studio, 1404)} 1404w`}
      sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1400px) 63vw, 860px"
      width={1404} height={520} loading="lazy" decoding="async" alt={STUDIOS[studio].alt} />
    <div className="studio-lettering"><span className="studio-kicker"><i />تصویرسازی کارگاه</span>
      <p>{top} <b>{bottom}</b></p></div>
  </header>
}

export function MemberCard({ member, loading }: { member: Member; loading: boolean }) {
  const { studio, sealed } = cardDesign(member)
  return <article className="member-sheet" data-studio={studio}>
    <StudioHeader studio={studio} sealed={sealed} />
    <div className={`profile-body${sealed ? ' locked-profile' : ''}`}>
      <div className="member-intro">
        <Portrait member={member} sealed={sealed} />
        <div className="member-identity">
          <span className="member-eyebrow"><i />عضو شماره {formatOrderBadge(member.sort_order)}</span>
          <h3>{member.name}</h3>
          <span className="member-role">{sealed ? 'در انتظار معرفی' : member.role}</span>
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
