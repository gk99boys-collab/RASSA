import { MotionConfig } from 'framer-motion'
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'

const STORAGE_KEY = 'rassa:quiet-motion'
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
function subscribeSystem(notify: () => void) {
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}

interface Preferences { enabled: boolean; systemQuiet: boolean; toggle: () => void }
const Context = createContext<Preferences | null>(null)

export function MotionPreferences({ children }: { children: ReactNode }) {
  const systemQuiet = useSyncExternalStore(subscribeSystem, () => media.matches)
  const [quiet, setQuiet] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
  })
  const enabled = !systemQuiet && !quiet
  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? 'on' : 'quiet'
    return () => { delete document.documentElement.dataset.motion }
  }, [enabled])
  function toggle() {
    if (systemQuiet) return
    try { localStorage.setItem(STORAGE_KEY, quiet ? '0' : '1') } catch { /* Storage is optional. */ }
    setQuiet(!quiet)
  }
  return <Context.Provider value={{ enabled, systemQuiet, toggle }}>
    <MotionConfig reducedMotion={enabled ? 'never' : 'always'}>{children}</MotionConfig>
  </Context.Provider>
}

export function useSiteMotion() {
  const value = useContext(Context)
  if (!value) throw new Error('Missing MotionPreferences provider')
  return value
}
