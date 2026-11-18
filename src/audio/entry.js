// Classic, tiny entry script: start the public page's single player before React,
// the intro, fonts, or team data are ready. The private desk never loads this file.
(() => {
  const src = document.querySelector('meta[name="rassa-soundtrack"]')?.content
  if (!src) return
  const audio = document.createElement('audio')
  audio.hidden = true
  audio.loop = true
  audio.preload = 'none'
  audio.volume = .3
  audio.src = src
  document.body.append(audio)

  const key = 'rassa:music-paused'
  const listeners = new Set()
  let state = 'paused', attempt = 0
  function change(next) { state = next; for (const notify of listeners) notify() }
  async function play(automatic) {
    const id = ++attempt
    change('starting')
    try { await audio.play() } catch (error) {
      if (id !== attempt) return
      change(error.name === 'NotAllowedError' ? (automatic ? 'blocked' : 'paused')
        : error.name === 'AbortError' ? 'paused' : 'unavailable')
    }
  }
  audio.addEventListener('playing', () => { if (!audio.paused) change('playing') })
  audio.addEventListener('pause', () => { if (audio.paused && ['starting', 'playing'].includes(state)) change('paused') })
  audio.addEventListener('error', () => { ++attempt; change('unavailable') })
  document.addEventListener('click', event => {
    if (state === 'blocked' && event.isTrusted && !event.target.closest?.('.soundtrack-key')) void play(false)
  }, true)
  window.rassaMusic = {
    read: () => state,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    toggle() {
      if (state === 'unavailable') return
      const active = state === 'playing' || state === 'starting'
      try { if (active) localStorage.setItem(key, '1'); else localStorage.removeItem(key) } catch { /* optional */ }
      if (active) { ++attempt; audio.pause(); change('paused') } else void play(false)
    },
  }
  try { if (localStorage.getItem(key) === '1') return } catch { /* optional */ }
  void play(true)
})()
