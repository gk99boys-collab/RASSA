import { ExternalLink, LockKeyhole, Sparkles, Trophy } from 'lucide-react'
import { PROJECT_ENTRIES } from '../data/projects'
import { toPersianDigits } from '../lib/supabase'
import { Reveal, SectionTitle } from './PrintUI'

function hostOf(url: string): string {
  try { return new URL(url).host } catch { return '' }
}

export function Projects() {
  return (
    <section id="projects" className="page-section" aria-labelledby="projects-title">
      <SectionTitle id="projects-title" label="پروژه‌ها" title="پروژه‌های تیم رَسا" meta={<><Trophy size={14} />سایت سال گذشته</>} />
      <Reveal className="project-grid">
        {PROJECT_ENTRIES.map((entry) => (
          <article key={entry.id} className="project-card paper">
            <div className="project-cover" aria-hidden="true">
              <span className="project-cover-letter">{entry.kicker.trim().charAt(0)}</span>
              <span className="project-badge"><Trophy size={11} strokeWidth={2.2} aria-hidden="true" />{entry.badge}</span>
              {hostOf(entry.url) && <span className="project-host mono" dir="ltr"><bdi>{hostOf(entry.url)}</bdi></span>}
            </div>
            <div className="project-body">
              <span className="project-kicker">{entry.kicker}</span>
              <h3 className="project-name">{entry.title}</h3>
              <p className="project-desc">{entry.description}</p>
              <ul className="project-tags" aria-label="فناوری‌های پروژه">
                <li>HTML5</li><li>CSS3</li><li>JavaScript</li><li>Responsive</li>
              </ul>
              <div className="project-foot">
                <span className="project-context">{entry.context}</span>
                <a className="project-cta" href={entry.url} target="_blank" rel="noopener noreferrer"
                  aria-label={`${entry.cta} — ${entry.title}`}>
                  {entry.cta} <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        ))}
        <article className="project-card project-card-upcoming paper">
          <div className="project-cover project-cover-upcoming" aria-hidden="true">
            <span className="project-cover-letter">۰۸</span>
            <span className="project-badge"><Sparkles size={11} strokeWidth={2.2} aria-hidden="true" />دوره هشتم</span>
            <span className="project-host mono" dir="ltr"><bdi>rassa-team · 1405</bdi></span>
          </div>
          <div className="project-body">
            <span className="project-kicker">رویداد ملی تولید محتوای دیجیتال بسیج</span>
            <h3 className="project-name">پروژه‌ی دوره هشتم — در حال ساخت</h3>
            <p className="project-desc">در حال طراحی و توسعه اپلیکیشن و محصول جدید تیم رَسا برای هشتمین دوره رویداد؛ به‌زودی پس از رونمایی رسمی اینجا منتشر می‌شود.</p>
            <ul className="project-tags" aria-label="فناوری‌های پروژه">
              <li>Mobile App</li><li>React</li><li>UI/UX</li>
            </ul>
            <div className="project-foot">
              <span className="project-context">سال جاری — دوره هشتم</span>
              <span className="project-soon"><LockKeyhole size={14} aria-hidden="true" /> به‌زودی</span>
            </div>
          </div>
        </article>
      </Reveal>
      <p className="project-count"><bdi className="mono" lang="en">RASSA/PROJECTS</bdi><span>{toPersianDigits(PROJECT_ENTRIES.length)} پروژه‌ی منتشرشده</span></p>
    </section>
  )
}
