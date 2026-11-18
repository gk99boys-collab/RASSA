import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { animate, useInView, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls } from 'framer-motion'

const FRAME_SECONDS = 3.6
function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify)
  return () => document.removeEventListener('visibilitychange', notify)
}

/** A single resumable clock drives all the printed layers. React only sees frame cuts, never ticks. */
export function useReel(ref: RefObject<HTMLElement | null>, count: number, allowed: boolean) {
  const inView = useInView(ref, { amount: .2 })
  const tabVisible = useSyncExternalStore(subscribeVisibility, () => !document.hidden)
  const [paused, setPaused] = useState(false)
  const [frame, setFrame] = useState(0)
  const time = useMotionValue(0)
  const cut = useTransform(time, (t) => Math.min(count - 1, Math.floor(t)))
  useMotionValueEvent(cut, 'change', setFrame)
  const playback = useRef<AnimationPlaybackControls | null>(null)
  const running = allowed && !paused && inView && tabVisible

  useEffect(() => {
    if (!running) return
    let cancelled = false
    function run() {
      if (cancelled) return
      if (time.get() >= count) time.jump(0)
      playback.current = animate(time, count, {
        duration: (count - time.get()) * FRAME_SECONDS, ease: 'linear', onComplete: run,
      })
    }
    run()
    return () => { cancelled = true; playback.current?.stop(); playback.current = null }
  }, [time, count, running])

  function seek(index: number) {
    // Park on the composed pose, not halfway through the cut between two prints.
    playback.current?.stop()
    setPaused(true)
    time.jump(index + .45)
    setFrame(index)
  }
  return { time, frame, paused, running, seek, toggle: () => setPaused((p) => !p) }
}
