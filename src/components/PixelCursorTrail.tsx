import React, { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface PixelParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
}

const TRAIL_COLORS = ['#E5252A', '#E5252A', '#22C55E', '#0A0A0A', '#FFFFFF']
const BURST_COLORS = ['#E5252A', '#22C55E', '#0A0A0A', '#FFFFFF']
const MAX_PARTICLES = 72

/**
 * Lightweight 60fps canvas pixel cursor trail + tap/click pixel burst.
 * Automatically disabled when prefers-reduced-motion is active.
 */
export const PixelCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: PixelParticle[] = []
    let rafId: number | null = null
    let lastX = -999
    let lastY = -999
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
    }

    const startLoop = () => {
      if (rafId !== null) return
      const tick = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.life += 1
          if (p.life >= p.maxLife) {
            particles.splice(i, 1)
            continue
          }
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.06

          const ratio = 1 - p.life / p.maxLife
          const snappedX = Math.round(p.x / 2) * 2
          const snappedY = Math.round(p.y / 2) * 2
          const s = p.size

          ctx.globalAlpha = Math.min(1, ratio * 1.25)
          ctx.fillStyle = '#0A0A0A'
          ctx.fillRect(snappedX - 1, snappedY - 1, s + 2, s + 2)
          ctx.fillStyle = p.color
          ctx.fillRect(snappedX, snappedY, s, s)
        }

        ctx.globalAlpha = 1

        if (particles.length > 0) {
          rafId = window.requestAnimationFrame(tick)
        } else {
          rafId = null
        }
      }
      rafId = window.requestAnimationFrame(tick)
    }

    const spawnTrail = (x: number, y: number) => {
      if (particles.length >= MAX_PARTICLES) particles.shift()
      const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)]
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 1.1,
        vy: (Math.random() - 0.3) * 1.1,
        size: Math.random() > 0.55 ? 6 : 5,
        color,
        life: 0,
        maxLife: 18 + Math.floor(Math.random() * 12),
      })
      startLoop()
    }

    const spawnBurst = (x: number, y: number) => {
      const count = 9
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift()
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3
        const speed = 1.8 + Math.random() * 2.4
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          size: i % 3 === 0 ? 7 : 5,
          color: BURST_COLORS[i % BURST_COLORS.length],
          life: 0,
          maxLife: 22 + Math.floor(Math.random() * 10),
        })
      }
      startLoop()
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      if (dx * dx + dy * dy < 320) return
      lastX = e.clientX
      lastY = e.clientY
      spawnTrail(e.clientX + 6, e.clientY + 8)
    }

    const onPointerDown = (e: PointerEvent) => {
      spawnBurst(e.clientX, e.clientY)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [shouldReduceMotion])

  if (shouldReduceMotion) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none z-40"
    />
  )
}
