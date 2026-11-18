import { MotionConfig } from 'framer-motion'
import { About } from './components/About'
import { Hero } from './components/Hero'
import { Honors } from './components/Honors'
import { MemberDirectory } from './components/MemberDirectory'
import { MinimalIntro } from './components/MinimalIntro'
import { PageCaption, SiteFooter, SiteHeader } from './components/SiteChrome'
import { useTeamData } from './hooks/useTeamData'

export default function App() {
  const { team, members, loading } = useTeamData()
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#content">رفتن به محتوای اصلی</a>
      <SiteHeader name={team.name} />
      <main className="page-width" id="content" tabIndex={-1}>
        <PageCaption />
        <Hero team={team} count={members.length} />
        <About team={team} loading={loading} />
        <MemberDirectory members={members} loading={loading} teamName={team.name} />
        <Honors text={team.achievement_text} count={members.length} loading={loading} />
      </main>
      <SiteFooter team={team} />
      <MinimalIntro />
    </MotionConfig>
  )
}
