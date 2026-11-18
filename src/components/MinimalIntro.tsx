import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronsLeft } from 'lucide-react'
import { EventLogo, RasaLogo } from './BrandMarks'
import { EASE } from './PrintUI'

const SEEN = 'rassa:seen-event-intro'
function firstVisit() {
  if (window.location.hash || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try { return !sessionStorage.getItem(SEEN) } catch { return true }
}

/** One short print ident per tab. The native modal also makes the page behind it inert. */
export function MinimalIntro() {
  const [open, setOpen] = useState(firstVisit)
  const [fading, setFading] = useState(false)
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDialogElement>(null)
  const finish = useCallback(() => {
    try { sessionStorage.setItem(SEEN, '1') } catch { /* Storage is optional. */ }
    setOpen(false)
  }, [])

  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    if (reduced || !dialog.showModal) { finish(); return }
    dialog.showModal()
    const fade = window.setTimeout(() => setFading(true), 710)
    const end = window.setTimeout(finish, 990)
    return () => { window.clearTimeout(fade); window.clearTimeout(end); dialog.close() }
  }, [open, finish, reduced])

  if (!open) return null
  return <motion.dialog ref={ref} aria-label="معرفی کوتاه تیم رَسا" className="intro"
    onCancel={(event) => { event.preventDefault(); finish() }} animate={{ opacity: fading ? 0 : 1 }} transition={{ duration: .26, ease: EASE }}>
    <div className="intro-center">
      <div className="intro-lockup"><motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32, ease: EASE }}>
        <RasaLogo className="intro-logo" /></motion.div>
        <motion.div className="intro-pointer" aria-hidden="true" initial={{ x: 86, y: 46, opacity: 0 }}
          animate={{ x: [86, 63, 29, 0, 0], y: [46, 16, -4, 0, 1], rotate: [-23, -21, -17, -12, -12], opacity: [0, 1, 1, 1, 1], scale: [1, 1, 1, .88, 1] }}
          transition={{ duration: .67, times: [0, .32, .64, .87, 1], ease: 'easeInOut' }}>
          <EventLogo className="intro-event" /></motion.div>
      </div>
      <button type="button" onClick={finish} className="intro-skip">رد کردن <ChevronsLeft size={14} /></button>
    </div>
  </motion.dialog>
}
