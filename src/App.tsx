import { useCallback, useState } from 'react'
import { About } from './components/About'
import { Projects } from './components/Projects'
import { Hero, Ticker } from './components/Hero'
import { Honors } from './components/Honors'
import { MemberDirectory } from './components/MemberDirectory'
import { firstVisit, MinimalIntro } from './components/MinimalIntro'
import { PageCaption, SiteFooter, SiteHeader } from './components/SiteChrome'
import { useTeamData } from './hooks/useTeamData'
import { MotionPreferences, useSiteMotion } from './motion/MotionPreferences'

function Profile() {
  const { team, members, loading } = useTeamData()
  const { enabled } = useSiteMotion()
  const [intro, setIntro] = useState(() => enabled && firstVisit())
  const finishIntro = useCallback(() => setIntro(false), [])
  return <>
    <a className="skip-link" href="#content">رفتن به محتوای اصلی</a>
    <SiteHeader name={team.name} />
    <main className="page-width" id="content" tabIndex={-1}>
      <PageCaption />
      <Hero team={team} count={members.length} ready={!intro} />
      <Ticker />
      <About team={team} loading={loading} />
      <MemberDirectory members={members} loading={loading} teamName={team.name} />
      <Honors text={team.achievement_text} count={members.length} loading={loading} />
      <Projects />
    </main>
    <SiteFooter team={team} />
    {intro && <MinimalIntro onFinish={finishIntro} />}
  </>
}

export default function App() {
  return <MotionPreferences><Profile /></MotionPreferences>
}
