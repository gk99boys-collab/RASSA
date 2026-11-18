import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Archive, Trophy } from 'lucide-react'
import { toPersianDigits } from '../lib/supabase'
import { useSiteMotion } from '../motion/MotionPreferences'
import { EASE, Reveal, SectionTitle, Skeleton } from './PrintUI'

/** Each digit is a strip of printed glyphs. Only its transform moves; no layout or live announcements per tick. */
function NumberWheel({ digit, place }: { digit: number; place: number }) {
  const glyphs = Array.from({ length: digit + 1 }, (_, i) => toPersianDigits(i))
  return <span className="digit-window"><motion.span className="digit-belt" initial={{ y: '0%' }}
    animate={{ y: `${-100 * digit / glyphs.length}%` }} transition={{ duration: .9, delay: place * .055, ease: EASE }}>
    {glyphs.map((glyph) => <span key={glyph}>{glyph}</span>)}
  </motion.span></span>
}

function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const printed = useInView(ref, { once: true, amount: .6 })
  const { enabled } = useSiteMotion()
  const digits = String(value).padStart(2, '0')
  const label = toPersianDigits(digits)
  return <span ref={ref} className="metric-value"><span className="sr-only">{label}</span>
    <span aria-hidden="true" dir="ltr" className="odometer">{enabled && printed
      ? Array.from(digits, (n, i) => <NumberWheel key={`${i}-${n}`} digit={Number(n)} place={i} />) : label}</span></span>
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
