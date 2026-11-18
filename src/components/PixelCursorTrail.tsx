import React, { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface PixelShard {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  gravity: number
}

interface PixelRing {
  x: number
  y: number
  radius: number
  maxRadius: number
  color: string
  life: number
  maxLife: number
}

const PALETTE = ['#E5252A', '#16B853', '#00D4C8', '#F0E808', '#FFFFFF', '#E5252A']
const MAX_SHARDS = 96
const MAX_RINGS = 8

/**
 * Super-animated 60fps HTML5 Canvas Chromatic Pixel Trail + Tap/Click Shockwave Engine.
 * Zero idle CPU (sleeps when idle) and strictly respects prefers-reduced-motion.
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

    const shards: PixelShard[] = []
    const rings: PixelRing[] = []
    let rafId: number | null = null
    let lastX = -999
    let lastY = -999

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
    }

    const startLoop = () => {
      if (rafId !== null) return
      const render = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

        // Render expanding pixel-square shockwave rings
        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i]
          r.life += 1
          if (r.life >= r.maxLife) {
            rings.splice(i, 1)
            continue
          }
          const t = r.life / r.maxLife
          const eased = 1 - Math.pow(1 - t, 3)
          const cur = Math.round((r.radius + (r.maxRadius - r.radius) * eased) / 2) * 2
          ctx.globalAlpha = Math.max(0, (1 - t) * 0.9)
          ctx.lineWidth = 3
          ctx.strokeStyle = '#080A0D'
          ctx.strokeRect(r.x - cur - 1, r.y - cur - 1, cur * 2 + 2, cur * 2 + 2)
          ctx.lineWidth = 2
          ctx.strokeStyle = r.color
          ctx.strokeRect(r.x - cur, r.y - cur, cur * 2, cur * 2)
        }

        // Render pixel shards with crisp black pixel border
        for (let i = shards.length - 1; i >= 0; i--) {
          const p = shards[i]
          p.life += 1
          if (p.life >= p.maxLife) {
            shards.splice(i, 1)
            continue
          }
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.96
          p.vy += p.gravity

          const remain = 1 - p.life / p.maxLife
          const sx = Math.round(p.x / 3) * 3
          const sy = Math.round(p.y / 3) * 3
          const sz = remain < 0.35 ? Math.max(4, p.size - 2) : p.size

          ctx.globalAlpha = Math.min(1, remain * 1.35)
          ctx.fillStyle = '#080A0D'
          ctx.fillRect(sx - 1.5, sy - 1.5, sz + 3, sz + 3)
          ctx.fillStyle = p.color
          ctx.fillRect(sx, sy, sz, sz)
        }

        ctx.globalAlpha = 1

        if (shards.length > 0 || rings.length > 0) {
          rafId = window.requestAnimationFrame(render)
        } else {
          rafId = null
        }
      }
      rafId = window.requestAnimationFrame(render)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const distSq = dx * dx + dy * dy
      if (distSq < 210) return
      lastX = e.clientX
      lastY = e.clientY

      const count = distSq > 1800 ? 2 : 1
      for (let i = 0; i < count; i++) {
        if (shards.length >= MAX_SHARDS) shards.shift()
        shards.push({
          x: e.clientX + 6 + (Math.random() - 0.5) * 10,
          y: e.clientY + 10 + (Math.random() - 0.5) * 10,
          vx: -dx * 0.04 + (Math.random() - 0.5) * 1.4,
          vy: -dy * 0.04 + (Math.random() - 0.4) * 1.4,
          size: Math.random() > 0.5 ? 7 : 5,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          life: 0,
          maxLife: 18 + Math.floor(Math.random() * 12),
          gravity: 0.05,
        })
      }
      startLoop()
    }

    const onPointerDown = (e: PointerEvent) => {
      if (rings.length >= MAX_RINGS) rings.shift()
      rings.push({
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        radius: 6,
        maxRadius: 38,
        color: '#16B853',
        life: 0,
        maxLife: 18,
      })

      const burstCount = 13
      for (let i = 0; i < burstCount; i++) {
        if (shards.length >= MAX_SHARDS) shards.shift()
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.25
        const speed = 2.2 + Math.random() * 3.4
        shards.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.1,
          size: i % 3 === 0 ? 8 : 6,
          color: PALETTE[i % PALETTE.length],
          life: 0,
          maxLife: 22 + Math.floor(Math.random() * 12),
          gravity: 0.14,
        })
      }
      startLoop()
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
