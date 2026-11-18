import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const track = document.querySelector<HTMLMetaElement>('meta[name="rassa-soundtrack"]')?.content
const PAUSED = 'rassa:music-paused'
type Playback = 'paused' | 'starting' | 'playing' | 'blocked' | 'unavailable'

function Player({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const request = useRef(0)
  const [state, setState] = useState<Playback>('paused')

  const play = useCallback(async (automatic: boolean) => {
    const el = audio.current
    if (!el) return
    const id = ++request.current
    setState('starting')
    try {
      await el.play()
    } catch (error) {
      if (id !== request.current) return // A pause or unmount cancelled this attempt.
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setState(automatic ? 'blocked' : 'paused')
      } else {
        setState(error instanceof Error && error.name === 'AbortError' ? 'paused' : 'unavailable')
      }
    }
  }, [])

  useEffect(() => {
    const el = audio.current!
    el.volume = .3
    let paused = false
    try { paused = localStorage.getItem(PAUSED) === '1' } catch { /* Storage is optional. */ }
    if (!paused) void play(true)
    return () => { ++request.current; el.pause() }
  }, [play])

  useEffect(() => {
    if (state !== 'blocked') return
    // A real click (including a tap or keyboard-activated button) supplies user activation.
    // Retry once, synchronously in that gesture. Never restart after an intentional pause.
    function unlock(event: MouseEvent) {
      if (!event.isTrusted || button.current?.contains(event.target as Node)) return
      document.removeEventListener('click', unlock, true)
      void play(false)
    }
    document.addEventListener('click', unlock, true)
    return () => document.removeEventListener('click', unlock, true)
  }, [state, play])

  const active = state === 'playing' || state === 'starting'
  const label = state === 'unavailable' ? 'موسیقی خراسانی در دسترس نیست'
    : active ? 'مکث موسیقی خراسانی' : 'پخش موسیقی خراسانی'

  function toggle() {
    try {
      if (active) localStorage.setItem(PAUSED, '1')
      else localStorage.removeItem(PAUSED)
    } catch { /* Still works for this visit. */ }
    if (active) {
      ++request.current
      audio.current?.pause()
      setState('paused')
    } else void play(false)
  }

  return <>
    <audio ref={audio} src={src} loop preload="none" hidden
      onPlaying={(e) => { if (!e.currentTarget.paused) setState('playing') }}
      onPause={(e) => { if (e.currentTarget.paused) setState(s => s === 'playing' || s === 'starting' ? 'paused' : s) }}
      onError={() => { ++request.current; setState('unavailable') }} />
    <button ref={button} type="button" className="soundtrack-key" data-playing={state === 'playing'}
      aria-label={label} title={label} onClick={toggle} disabled={state === 'unavailable'}>
      {active ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}<span>خراسانی</span>
    </button>
  </>
}

export function SoundtrackControl() {
  return track ? <Player src={track} /> : null
}
