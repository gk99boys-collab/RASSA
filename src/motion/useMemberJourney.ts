import { useCallback, useLayoutEffect, useRef } from 'react'

/** Convert native document travel into card stops. Never cancel wheel, key or touch events. */
export function useMemberJourney(count: number, enabled: boolean, onStop: (index: number) => void) {
  const track = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const metrics = useRef<{ top: number; step: number } | null>(null)

  useLayoutEffect(() => {
    const root = track.current, content = stage.current
    if (!root || !content || !enabled || count < 2) return
    let last = -1, frame = 0
    function sync() {
      frame = 0
      const m = metrics.current
      if (!m) return
      const index = Math.max(0, Math.min(count - 1, Math.round((m.top - root!.getBoundingClientRect().top) / m.step)))
      if (index !== last) { last = index; onStop(index) }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(sync) }
    function measure() {
      const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 8
      const room = window.innerHeight - top - content!.offsetHeight
      // At high zoom, on a short screen, or for a long bio, leave everything readable in normal flow.
      if (room < 4) {
        const box = root!.getBoundingClientRect()
        const held = !!metrics.current && box.top <= top && box.bottom > top
        metrics.current = null; last = -1; delete root!.dataset.pinned
        if (held) window.scrollTo({ top: window.scrollY + box.top - top, behavior: 'instant' })
        return
      }
      const step = Math.round(Math.max(180, Math.min(420, window.innerHeight * .45)))
      metrics.current = { top, step }
      root!.style.setProperty('--member-top', `${top}px`)
      root!.style.setProperty('--member-travel', `${(count - 1) * step + room}px`)
      root!.dataset.pinned = 'true'
      schedule()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(content)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      ro.disconnect(); cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure); window.removeEventListener('scroll', schedule)
      metrics.current = null; delete root.dataset.pinned
      root.style.removeProperty('--member-top'); root.style.removeProperty('--member-travel')
    }
  }, [count, enabled, onStop])

  const jump = useCallback((i: number) => {
    const m = metrics.current
    if (!m || !track.current) return
    const start = track.current.getBoundingClientRect().top + window.scrollY - m.top
    window.scrollTo({ top: start + i * m.step, behavior: 'instant' })
  }, [])
  return { track, stage, jump }
}
