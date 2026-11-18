import React from 'react'

const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`

/**
 * Official RASSA team logo (transparent PNG with flowing teal wave + wordmark).
 */
export const RasaLogo: React.FC<{
  className?: string
  alt?: string
}> = ({ className = 'w-40', alt = 'لوگوی تیم رَسا' }) => (
  <img
    src={asset('logo-rasa.png')}
    alt={alt}
    decoding="async"
    draggable={false}
    className={`object-contain select-none ${className}`}
  />
)

/**
 * Official RASSA wave symbol (transparent PNG mark).
 */
export const RasaMark: React.FC<{
  className?: string
  alt?: string
}> = ({ className = 'w-8', alt = '' }) => (
  <img
    src={asset('logo-rasa-mark.png')}
    alt={alt}
    aria-hidden={alt === '' ? true : undefined}
    decoding="async"
    draggable={false}
    className={`object-contain select-none ${className}`}
  />
)

/**
 * Official 8th National Basij Digital Content Production Event logo
 * (pixel-glitch cursor arrow, rendered crisp).
 */
export const EventLogo: React.FC<{
  className?: string
  alt?: string
  tilted?: boolean
}> = ({ className = 'w-5 h-7', alt = '', tilted = false }) => (
  <img
    src={asset('logo-event.png')}
    alt={alt}
    aria-hidden={alt === '' ? true : undefined}
    decoding="async"
    draggable={false}
    style={{ imageRendering: 'pixelated' }}
    className={`object-contain select-none ${tilted ? '-rotate-[24deg]' : ''} ${className}`}
  />
)

/**
 * Minimalist editorial monogram avatar shown when a member has no uploaded photo yet.
 * Automatically replaced by their real photo once `photo_url` is set in Supabase.
 */
export const MinimalMemberAvatar: React.FC<{
  name: string
  sortOrder: number
}> = ({ name, sortOrder }) => {
  const palettes = [
    { from: '#E6F7F6', to: '#F4FBFB', accent: '#008F8C', ring: 'rgba(0, 143, 140, 0.16)' },
    { from: '#E8F6FB', to: '#F5FAFD', accent: '#0284C7', ring: 'rgba(2, 132, 199, 0.15)' },
    { from: '#EAF8F0', to: '#F5FCF8', accent: '#0E9F47', ring: 'rgba(14, 159, 71, 0.15)' },
    { from: '#FDF0F0', to: '#FEF8F8', accent: '#D92D32', ring: 'rgba(217, 45, 50, 0.14)' },
  ]
  const palette = palettes[(Math.max(1, sortOrder) - 1) % palettes.length]

  const cleaned = name.replace(/^سید\s+/, '').trim()
  const initial = cleaned.charAt(0) || 'ر'

  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
        boxShadow: `inset 0 0 0 1px ${palette.ring}`,
      }}
      className="w-full h-full flex items-center justify-center relative overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Subtle concentric circle geometry */}
      <div
        style={{ borderColor: palette.ring }}
        className="absolute w-[78%] h-[78%] rounded-full border"
      />
      <span
        style={{ color: palette.accent }}
        className="relative font-black text-4xl sm:text-5xl leading-none"
      >
        {initial}
      </span>
    </div>
  )
}
