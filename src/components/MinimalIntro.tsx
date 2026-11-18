import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronsLeft } from 'lucide-react'
import { EventLogo, RasaLogo } from './BrandMarks'
import { EASE } from './PrintUI'
import { useSiteMotion } from '../motion/MotionPreferences'

const SEEN = 'rassa:seen-event-intro'
export function firstVisit() {
  if (window.location.hash) return false
  try { return !sessionStorage.getItem(SEEN) } catch { return true }
}

/** A brief registration proof. Closing the native dialog cues the hero instead of hiding its entrance. */
export function MinimalIntro({ onFinish }: { onFinish: () => void }) {
  const [printing, setPrinting] = useState(false)
  const { enabled } = useSiteMotion()
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!enabled || !dialog.showModal) { onFinish(); return }
    try { sessionStorage.setItem(SEEN, '1') } catch { /* Still skippable without storage. */ }
    dialog.showModal()
    const print = window.setTimeout(() => setPrinting(true), 790)
    const end = window.setTimeout(onFinish, 1170)
    return () => { window.clearTimeout(print); window.clearTimeout(end); dialog.close() }
  }, [onFinish, enabled])

  return <motion.dialog ref={ref} aria-label="معرفی کوتاه تیم رَسا" className="intro"
    onCancel={(e) => { e.preventDefault(); onFinish() }} animate={{ opacity: printing ? 0 : 1 }} transition={{ duration: .35, ease: EASE }}>
    <div className="intro-center">
      <div className="intro-proof">
        <span className="proof-id mono" aria-hidden="true" dir="ltr">RASSA / 08</span>
        <svg viewBox="0 0 240 160" className="proof-guide" aria-hidden="true">
          <motion.path d="M228 135 C186 134 213 36 139 66" fill="none" stroke="currentColor" strokeDasharray="3 4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .6, ease: EASE }} />
        </svg>
        <motion.div initial={{ opacity: .2, y: 12, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .5, ease: EASE }}><RasaLogo className="intro-logo" /></motion.div>
        <motion.div className="intro-pointer" aria-hidden="true" initial={{ x: 89, y: 61, opacity: 0 }}
          animate={{ x: [89, 55, 31, 0, 0], y: [61, 28, -8, 0, 1], rotate: [-28, -22, -16, -12, -12], opacity: [0, 1, 1, 1, 1], scale: [1, 1, 1, .82, 1] }}
          transition={{ duration: .73, times: [0, .32, .64, .87, 1], ease: 'easeInOut' }}>
          <EventLogo className="intro-event" /></motion.div>
        <motion.i className="proof-ink" aria-hidden="true" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .76, ease: EASE }} />
      </div>
      <button type="button" onClick={onFinish} className="intro-skip">رد کردن <ChevronsLeft size={14} /></button>
    </div>
  </motion.dialog>
}
