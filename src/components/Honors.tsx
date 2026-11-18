import { useSiteMotion } from '../motion/MotionPreferences'
import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { Archive, Trophy } from 'lucide-react'
import { formatOrderBadge } from '../lib/supabase'
import { EASE, Reveal, SectionTitle, Skeleton } from './PrintUI'

function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true, amount: .6 })
  const { enabled } = useSiteMotion()
  const count = useMotionValue(value)
  const display = useTransform(count, (n) => formatOrderBadge(Math.round(n)))
  useEffect(() => {
    if (!visible || !enabled) { count.set(value); return }
    count.set(0)
    const animation = animate(count, value, { duration: .85, ease: EASE })
    return () => animation.stop()
  }, [visible, enabled, count, value])
  return <span ref={ref} className="metric-value"><span className="sr-only">{formatOrderBadge(value)}</span><motion.span aria-hidden="true">{display}</motion.span></span>
}

export function Honors({ text, count, loading }: { text: string; count: number; loading: boolean }) {
  const metrics = [{ value: 1, label: 'رتبه شهرستانی' }, { value: 7, label: 'دوره کسب عنوان' }, { value: count, label: 'اعضای تیم' }]
  return (
    <section id="honors" className="page-section" aria-labelledby="honors-title">
      <SectionTitle id="honors-title" label="افتخار" title="کارنامه تیم" red meta={<><Archive size={14} />بایگانی افتخارات</>} />
      <Reveal className="honors-grid"><div className="honor-story paper"><div className="trophy-box"><Trophy size={31} strokeWidth={1.65} /></div>
        <div><span className="honor-eyebrow">افتخار ثبت‌شده تیم</span>
          {loading ? <Skeleton label="در حال دریافت افتخار تیم" /> : <h3>{text}</h3>}</div></div>
        {metrics.map(({ value, label }) => <div className="metric paper" key={label}><Count value={value} /><span>{label}</span></div>)}
      </Reveal>
    </section>
  )
}
