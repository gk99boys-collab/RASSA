import type { KeyboardEvent } from 'react'

/** Roving focus with RTL arrow order. Page scrolling remains native outside the tablist. */
export function tabKeys(event: KeyboardEvent<HTMLButtonElement>, current: number, count: number,
  select: (index: number) => void, vertical = false) {
  let next: number
  switch (event.key) {
    case 'Home': next = 0; break
    case 'End': next = count - 1; break
    case 'ArrowUp': if (!vertical) return; next = current - 1; break
    case 'ArrowDown': if (!vertical) return; next = current + 1; break
    case 'ArrowRight': if (vertical) return; next = current - 1; break
    case 'ArrowLeft': if (vertical) return; next = current + 1; break
    default: return
  }
  event.preventDefault()
  next = (next + count) % count
  select(next)
  event.currentTarget.closest('[role="tablist"]')?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
}
