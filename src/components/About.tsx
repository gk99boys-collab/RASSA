import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CornerDownLeft, Layers3, Route, Sparkles } from 'lucide-react'
import { formatOrderBadge } from '../lib/supabase'
import { tabKeys } from '../lib/tabKeys'
import type { Team } from '../types'
import { EASE, Skeleton, SPRING } from './PrintUI'

const STEPS = [
  { title: 'می‌رسیم', icon: Route, note: 'نیاز کاربر را می‌شناسیم و مسیر ایده را پیدا می‌کنیم.' },
  { title: 'می‌سازیم', icon: Layers3, note: 'با طراحی دقیق و کدنویسی، ایده را به محصول تبدیل می‌کنیم.' },
  { title: 'می‌درخشیم', icon: Sparkles, note: 'نتیجه‌ی کار تیمی را برای رقابت در دوره‌ی هشتم ارائه می‌کنیم.' },
]

export function About({ team, loading }: { team: Team; loading: boolean }) {
  const [step, setStep] = useState(0)
  const reduced = useReducedMotion()
  return (
    <section id="about" className="paper about" aria-labelledby="about-title">
      <div className="about-copy"><div className="heading-pair"><span className="flag flag-red">معرفی</span><h2 id="about-title">درباره تیم {team.name}</h2></div>
        <div aria-busy={loading}>{loading ? <Skeleton label="در حال دریافت معرفی تیم" /> : <p>{team.description}</p>}</div>
      </div>
      <div className="values">
        <div role="tablist" aria-label="سه گام رَسا" className="value-tabs">
          {STEPS.map(({ title, icon: Icon }, i) => <button key={title} type="button" role="tab" id={`value-${i}`}
            aria-controls="value-note" aria-selected={step === i} tabIndex={step === i ? 0 : -1}
            onClick={() => setStep(i)} onKeyDown={(e) => tabKeys(e, i, STEPS.length, setStep)}>
            {step === i && <motion.span className="value-fill" aria-hidden="true" layoutId={reduced ? undefined : 'value-selection'} transition={SPRING} />}
            <span className="value-iconline"><Icon size={23} strokeWidth={1.8} /><small>{formatOrderBadge(i + 1)}</small></span>
            <strong>{title}</strong>
          </button>)}
        </div>
        <div className="value-note" id="value-note" role="tabpanel" tabIndex={0} aria-labelledby={`value-${step}`}>
          <CornerDownLeft size={14} aria-hidden="true" /><motion.p key={step} initial={reduced ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .25, ease: EASE }}>{STEPS[step].note}</motion.p>
        </div>
      </div>
    </section>
  )
}
