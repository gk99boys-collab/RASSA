import { useSyncExternalStore } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Music = {
  read: () => 'paused' | 'starting' | 'playing' | 'blocked' | 'unavailable'
  subscribe: (notify: () => void) => () => void
  toggle: () => void
}
declare global { interface Window { rassaMusic?: Music } }

function Control({ music }: { music: Music }) {
  const state = useSyncExternalStore(music.subscribe, music.read)
  const active = state === 'playing' || state === 'starting'
  const label = state === 'unavailable' ? 'موسیقی خراسانی در دسترس نیست'
    : active ? 'مکث موسیقی خراسانی' : 'پخش موسیقی خراسانی'
  return <button type="button" className="soundtrack-key" data-playing={state === 'playing'}
    aria-label={label} title={label} onClick={music.toggle} disabled={state === 'unavailable'}>
    {active ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}<span>خراسانی</span>
  </button>
}

export function SoundtrackControl() {
  return window.rassaMusic ? <Control music={window.rassaMusic} /> : null
}
