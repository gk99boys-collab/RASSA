import { useCallback, useLayoutEffect, useRef } from 'react'

type Stops = { top: number; step: number }

/** Map native document travel to the cards. No wheel, touch or keyboard event is consumed. */
export function useMemberJourney(count: number, enabled: boolean, onStop: (index: number) => void) {
  const track = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const metrics = useRef<Stops | null>(null)
  const manualStop = useRef<number | null>(null)

  useLayoutEffect(() => {
    const root = track.current, content = stage.current
    if (!root || !content || !enabled || count < 2) return
    // On a short screen the heading, then the mobile tab strip, may scroll away.
    // The actual card and its controls must always fit; never crop a long bio.
    const anchors = [content, ...content.querySelectorAll<HTMLElement>('[data-journey-anchor]')]
    const masthead = document.querySelector<HTMLElement>('.masthead')
    let last = -1, frame = 0, anchor = 0
    function sync() {
      frame = 0
      const m = metrics.current
      if (!m) return
      const index = Math.max(0, Math.min(count - 1, Math.round((m.top - root!.getBoundingClientRect().top) / m.step)))
      if (index !== last) { last = index; onStop(index) }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(sync) }
    function measure() {
      const roof = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 8
      const box = root!.getBoundingClientRect(), stageBox = content!.getBoundingClientRect()
      const docTop = window.scrollY + box.top
      const offsets = anchors.map(el => el.getBoundingClientRect().top - stageBox.top)
      // A small gap above a compact card keeps the previous tab strip entirely
      // behind the masthead rather than leaving a clipped sliver of it visible.
      const compactRoof = Math.min(roof, (masthead?.offsetHeight ?? roof) + 6)
      const firstFit = offsets.findIndex((offset, i) => window.innerHeight - (i ? compactRoof : roof) - stageBox.height + offset >= 4)
      const prev = metrics.current
      const travel = prev ? prev.top - box.top : 0
      const progress = prev ? Math.max(0, Math.min(count - 1, travel / prev.step)) : 0
      // Scroll positions round to physical pixels at both endpoints.
      const held = !!prev && travel >= -1 && travel <= (count - 1) * prev.step + 1
      if (firstFit === -1) {
        metrics.current = null; last = -1; delete root!.dataset.pinned
        if (held) window.scrollTo({ top: docTop + offsets[offsets.length - 1] - roof, behavior: 'instant' })
        return
      }
      // Don't bring the heading back mid-read just because the next bio is shorter.
      anchor = prev && box.top <= roof + 1 ? Math.max(firstFit, anchor) : firstFit
      const top = (anchor ? compactRoof : roof) - offsets[anchor]
      const step = Math.round(Math.max(180, Math.min(420, window.innerHeight * .45)))
      metrics.current = { top, step }
      root!.style.setProperty('--member-top', `${top}px`)
      root!.style.setProperty('--member-travel', `${(count - 1) * step}px`)
      root!.style.setProperty('--member-window', `${window.innerHeight - top}px`)
      root!.dataset.pinned = 'true'
      // Preserve the current stop across viewport changes and when a manually
      // chosen, shorter card fits again. Never pull an offscreen reader back.
      const requested = manualStop.current
      manualStop.current = null
      if (requested !== null && box.top < window.innerHeight && box.bottom > roof) {
        window.scrollTo({ top: docTop - top + Math.min(requested, count - 1) * step, behavior: 'instant' })
      } else if (held && prev && (prev.top !== top || prev.step !== step)) {
        window.scrollTo({ top: docTop - top + progress * step, behavior: 'instant' })
      }
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
      metrics.current = null; manualStop.current = null; delete root.dataset.pinned
      for (const name of ['--member-top', '--member-travel', '--member-window']) root.style.removeProperty(name)
    }
  }, [count, enabled, onStop])

  const jump = useCallback((i: number) => {
    const m = metrics.current
    if (!m || !track.current) { manualStop.current = i; return }
    const start = track.current.getBoundingClientRect().top + window.scrollY - m.top
    window.scrollTo({ top: start + i * m.step, behavior: 'instant' })
  }, [])
  return { track, stage, jump }
}
