import React from 'react'

const BASE = import.meta.env.BASE_URL

/**
 * Official RASSA Team Full Logo (swooping teal calligraphic ribbon + RASSA wordmark).
 */
export const RasaTeamLogo: React.FC<{
  className?: string
  alt?: string
  glow?: boolean
}> = ({ className = 'w-56', alt = 'لوگوی رسمی تیم نرم‌افزاری رَسا (RASSA)', glow = false }) => (
  <img
    src={`${BASE}logo-rasa.png`}
    alt={alt}
    decoding="async"
    draggable={false}
    className={`select-none object-contain ${
      glow ? 'drop-shadow-[0_0_24px_rgba(0,212,200,0.38)]' : ''
    } ${className}`}
  />
)

/**
 * Official RASSA Standalone Wave Crest (for compact badges, navbar, marquee & cards).
 */
export const RasaWaveMark: React.FC<{
  className?: string
  alt?: string
}> = ({ className = 'w-9', alt = '' }) => (
  <img
    src={`${BASE}logo-rasa-mark.png`}
    alt={alt}
    aria-hidden={alt ? undefined : true}
    decoding="async"
    draggable={false}
    className={`select-none object-contain ${className}`}
  />
)

/**
 * Official 8th National Basij Digital Content Production Event Pixel-Glitch Cursor Logo.
 */
export const EventCursorLogo: React.FC<{
  className?: string
  alt?: string
  tilted?: boolean
}> = ({ className = 'w-12 h-16', alt = '', tilted = false }) => (
  <img
    src={`${BASE}logo-event.png`}
    alt={alt}
    aria-hidden={alt ? undefined : true}
    decoding="async"
    draggable={false}
    className={`select-none object-contain pixel-crisp ${
      tilted ? '-rotate-[28deg]' : ''
    } ${className}`}
  />
)

/**
 * Decorative neo-brutalist pixel barcode strip for ID dossiers & poster headers.
 */
export const PixelBarcode: React.FC<{ className?: string; color?: string }> = ({
  className = 'h-5',
  color = 'currentColor',
}) => {
  const widths = [3, 1, 2, 1, 4, 2, 1, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2]
  let x = 0
  return (
    <svg
      viewBox="0 0 58 14"
      className={`select-none shrink-0 ${className}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {widths.map((w, i) => {
        const cx = x
        x += w + (i % 2 === 0 ? 1.5 : 2)
        return <rect key={i} x={cx} y={0} width={w} height={14} fill={color} />
      })}
    </svg>
  )
}

/**
 * Animated 8-bar pixel equalizer matching event & team accent palette.
 */
export const PixelEqualizer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const bars = [
    { delay: '0s', color: '#16B853' },
    { delay: '0.18s', color: '#00D4C8' },
    { delay: '0.34s', color: '#E5252A' },
    { delay: '0.08s', color: '#F0E808' },
    { delay: '0.26s', color: '#00D4C8' },
    { delay: '0.42s', color: '#16B853' },
    { delay: '0.14s', color: '#E5252A' },
    { delay: '0.3s', color: '#FFFFFF' },
  ]
  return (
    <div className={`inline-flex items-end gap-[3px] h-5 ${className}`} aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          className="eq-bar w-[4px] h-full block"
          style={{
            backgroundColor: b.color,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Super-Graphical Pixel-Art #1 Champion Medal & Laurel Crest (Achievement Arena).
 */
export const PixelChampionMedal: React.FC<{ className?: string }> = ({
  className = 'w-36 h-40',
}) => (
  <svg
    viewBox="0 0 36 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`select-none shrink-0 ${className}`}
    role="img"
    aria-label="مدال پیکسلی قهرمانی رتبه اول"
  >
    {/* Chromatic pixel sparks echoing the official 8th Event logo */}
    <rect x="2" y="14" width="3" height="3" fill="#080A0D" />
    <rect x="2" y="14" width="2" height="2" fill="#16B853" />
    <rect x="31" y="12" width="3" height="3" fill="#080A0D" />
    <rect x="32" y="12" width="2" height="2" fill="#F0E808" />
    <rect x="3" y="33" width="3" height="3" fill="#080A0D" />
    <rect x="3" y="33" width="2" height="2" fill="#00D4C8" />
    <rect x="30" y="34" width="3" height="3" fill="#080A0D" />
    <rect x="31" y="34" width="2" height="2" fill="#16B853" />
    <rect x="0" y="24" width="3" height="1" fill="#F0E808" />
    <rect x="33" y="22" width="3" height="1" fill="#00D4C8" />

    {/* Dual V-Ribbon with thick black pixel border */}
    <path
      fill="#080A0D"
      d="M5 1h9v2h1v3h2v2h2V6h2V3h1V1h9v7h-1v3h-2v3h-2v2H10v-2H8v-3H6V8H5V1z"
    />
    {/* Left ribbon stripes (White + Green + Black) */}
    <path fill="#FFFFFF" d="M7 3h5v3h1v3h2v4h-3v-2h-2V8H8V6H7V3z" />
    <path fill="#16B853" d="M9 3h2v5H9V3zm2 5h2v4h-2V8z" />
    {/* Right ribbon stripes (White + Cyan/Green) */}
    <path fill="#FFFFFF" d="M24 3h5v3h-1v2h-2v3h-2v2h-3V9h2V6h1V3z" />
    <path fill="#00A8A8" d="M25 3h2v5h-2V3zm-2 5h2v4h-2V8z" />

    {/* Clasp bar */}
    <rect x="13" y="13" width="10" height="3" fill="#080A0D" />
    <rect x="14" y="14" width="8" height="1" fill="#F0E808" />

    {/* Hard offset shadow beneath octagonal medal */}
    <path
      fill="#080A0D"
      d="M10 17h14v2h3v3h2v12h-2v3h-3v2H10v-2H7v-3H5V22h2v-3h3v-2z"
    />

    {/* Medal outer black pixel rim */}
    <path
      fill="#080A0D"
      d="M12 15h12v2h3v3h2v12h-2v3h-3v2H12v-2H9v-3H7V20h2v-3h3v-2z"
    />

    {/* Crisp White Outer Bevel with RGB glitch edges */}
    <path
      fill="#FFFFFF"
      d="M12 17h12v2h3v2h1v10h-1v2h-3v2H12v-2H9v-2H8V21h1v-2h3v-2z"
    />
    {/* Subtle chromatic edges matching event logo */}
    <rect x="8" y="21" width="1" height="10" fill="#F0E808" />
    <rect x="27" y="21" width="1" height="10" fill="#00D4C8" />

    {/* Bold Red Inner Ring */}
    <path
      fill="#E5252A"
      d="M13 19h10v2h2v10h-2v2H13v-2h-2V21h2v-2z"
    />

    {/* White Champion Core */}
    <rect x="13" y="21" width="10" height="10" fill="#FFFFFF" />

    {/* Green pixel laurel corners */}
    <rect x="12" y="20" width="2" height="2" fill="#16B853" />
    <rect x="22" y="20" width="2" height="2" fill="#16B853" />
    <rect x="12" y="30" width="2" height="2" fill="#16B853" />
    <rect x="22" y="30" width="2" height="2" fill="#16B853" />

    {/* Bold Pixel #1 Trophy Numeral with red/cyan chromatic fringe */}
    <rect x="16" y="23" width="1" height="6" fill="#E5252A" />
    <rect x="19" y="23" width="1" height="6" fill="#00D4C8" />
    <rect x="17" y="22" width="2" height="7" fill="#080A0D" />
    <rect x="15" y="23" width="2" height="2" fill="#080A0D" />
    <rect x="15" y="29" width="6" height="2" fill="#080A0D" />
  </svg>
)

/**
 * Super-graphical bespoke Pixel-Art Workstation Posters for Members 1..4
 * (displayed until real photos are uploaded to Supabase `member-photos`).
 */
export const PixelWorkstationPoster: React.FC<{
  sortOrder: number
  name: string
}> = ({ sortOrder, name }) => {
  const variant = ((sortOrder - 1) % 4) + 1

  return (
    <div
      className="relative w-full h-full bg-[#090D12] flex items-center justify-center overflow-hidden select-none p-4"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.13) 1.2px, transparent 1.2px), radial-gradient(circle at 50% 45%, rgba(0,180,180,0.22), transparent 68%)',
        backgroundSize: '12px 12px, 100% 100%',
      }}
      role="img"
      aria-label={`تصویر گرافیکی پیکسلی ${name}`}
    >
      {/* Corner pixel targeting reticles */}
      <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-[3px] border-r-[3px] border-[#16B853]" />
      <span className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-[3px] border-l-[3px] border-[#00D4C8]" />
      <span className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-[3px] border-r-[3px] border-[#E5252A]" />
      <span className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-[3px] border-l-[3px] border-[#F0E808]" />

      {/* Subtle CRT lines */}
      <div className="absolute inset-0 pixel-scanlines pointer-events-none" aria-hidden="true" />

      {variant === 1 && (
        /* 01: Captain / PM / Graphic & Animation Director */
        <svg viewBox="0 0 32 32" className="w-36 h-36 relative z-10" shapeRendering="crispEdges">
          {/* Floating pixel sparks */}
          <rect x="3" y="5" width="2" height="2" fill="#16B853" />
          <rect x="27" y="4" width="2" height="2" fill="#F0E808" />
          <rect x="28" y="18" width="2" height="1" fill="#00D4C8" />
          {/* Captain Pixel Crown */}
          <path
            fill="#080A0D"
            d="M7 3h3v2h2v2h2V4h1V2h2v2h1v3h2V5h2V3h3v9H7V3z"
          />
          <path
            fill="#E5252A"
            d="M8 4h1v2h2v2h3V5h1V3h2v2h1v3h3V6h2V4h1v6H8V4z"
          />
          <rect x="8" y="10" width="16" height="1" fill="#F0E808" />
          <rect x="15" y="6" width="2" height="2" fill="#FFFFFF" />
          <rect x="10" y="7" width="2" height="2" fill="#16B853" />
          <rect x="20" y="7" width="2" height="2" fill="#00D4C8" />
          {/* Studio Timeline & Design Monitor */}
          <rect x="3" y="13" width="26" height="15" fill="#FFFFFF" />
          <rect x="4" y="14" width="24" height="13" fill="#0E141B" />
          {/* Top title bar */}
          <rect x="4" y="14" width="24" height="3" fill="#E5252A" />
          <rect x="5" y="15" width="2" height="1" fill="#FFFFFF" />
          <rect x="8" y="15" width="2" height="1" fill="#16B853" />
          <rect x="25" y="15" width="2" height="1" fill="#F0E808" />
          {/* Kanban / Animation timeline tracks */}
          <rect x="6" y="19" width="8" height="2" fill="#00D4C8" />
          <rect x="16" y="19" width="10" height="2" fill="#16B853" />
          <rect x="6" y="23" width="12" height="2" fill="#E5252A" />
          <rect x="20" y="23" width="6" height="2" fill="#FFFFFF" />
          {/* Playhead line */}
          <rect x="15" y="17" width="1" height="10" fill="#F0E808" />
          {/* Monitor stand */}
          <rect x="12" y="28" width="8" height="2" fill="#FFFFFF" />
        </svg>
      )}

      {variant === 2 && (
        /* 02: Mobile App Developer */
        <svg viewBox="0 0 32 32" className="w-36 h-36 relative z-10" shapeRendering="crispEdges">
          {/* Floating UI cards popping off phone */}
          <rect x="2" y="7" width="6" height="5" fill="#E5252A" />
          <rect x="3" y="8" width="4" height="1" fill="#FFFFFF" />
          <rect x="3" y="10" width="2" height="1" fill="#F0E808" />
          <rect x="24" y="18" width="6" height="5" fill="#16B853" />
          <rect x="25" y="20" width="4" height="1" fill="#FFFFFF" />
          <rect x="26" y="6" width="2" height="2" fill="#00D4C8" />
          <rect x="3" y="23" width="2" height="2" fill="#F0E808" />
          {/* Smartphone frame */}
          <rect x="8" y="2" width="16" height="28" fill="#FFFFFF" />
          <rect x="9" y="3" width="14" height="26" fill="#080A0D" />
          <rect x="10" y="5" width="12" height="21" fill="#111922" />
          {/* Dynamic notch */}
          <rect x="14" y="3" width="4" height="1" fill="#00D4C8" />
          {/* App hero banner */}
          <rect x="11" y="6" width="10" height="5" fill="#E5252A" />
          <rect x="12" y="7" width="5" height="1" fill="#FFFFFF" />
          <rect x="12" y="9" width="3" height="1" fill="#F0E808" />
          {/* Code / app widgets */}
          <rect x="11" y="12" width="4" height="5" fill="#00D4C8" />
          <rect x="16" y="12" width="5" height="2" fill="#FFFFFF" />
          <rect x="16" y="15" width="5" height="2" fill="#16B853" />
          {/* Bottom action bar */}
          <rect x="11" y="19" width="10" height="3" fill="#FFFFFF" />
          <rect x="12" y="20" width="6" height="1" fill="#080A0D" />
          <rect x="19" y="20" width="1" height="1" fill="#E5252A" />
          <rect x="11" y="23" width="10" height="2" fill="#00A8A8" />
          {/* Home bar */}
          <rect x="14" y="27" width="4" height="1" fill="#16B853" />
        </svg>
      )}

      {variant === 3 && (
        /* 03: Backend & Database Architect */
        <svg viewBox="0 0 32 32" className="w-36 h-36 relative z-10" shapeRendering="crispEdges">
          {/* Data stream sparks */}
          <rect x="2" y="6" width="2" height="2" fill="#00D4C8" />
          <rect x="28" y="14" width="2" height="2" fill="#16B853" />
          <rect x="2" y="22" width="2" height="2" fill="#E5252A" />
          {/* Server Blade 1 */}
          <rect x="5" y="3" width="22" height="7" fill="#FFFFFF" />
          <rect x="6" y="4" width="20" height="5" fill="#0D131A" />
          <rect x="7" y="5" width="3" height="3" fill="#16B853" />
          <rect x="11" y="5" width="2" height="3" fill="#00D4C8" />
          <rect x="16" y="5" width="9" height="1" fill="#FFFFFF" />
          <rect x="16" y="7" width="6" height="1" fill="#E5252A" />
          {/* Connector bus */}
          <rect x="10" y="10" width="2" height="2" fill="#00D4C8" />
          <rect x="20" y="10" width="2" height="2" fill="#E5252A" />
          {/* Server Blade 2 (Primary Red Core) */}
          <rect x="5" y="12" width="22" height="8" fill="#FFFFFF" />
          <rect x="6" y="13" width="20" height="6" fill="#E5252A" />
          <rect x="7" y="15" width="3" height="2" fill="#FFFFFF" />
          <rect x="11" y="15" width="2" height="2" fill="#F0E808" />
          <rect x="15" y="14" width="10" height="4" fill="#080A0D" />
          <rect x="16" y="15" width="3" height="2" fill="#16B853" />
          <rect x="20" y="15" width="4" height="2" fill="#00D4C8" />
          {/* Connector bus */}
          <rect x="10" y="20" width="2" height="2" fill="#16B853" />
          <rect x="20" y="20" width="2" height="2" fill="#00D4C8" />
          {/* Server Blade 3 */}
          <rect x="5" y="22" width="22" height="7" fill="#FFFFFF" />
          <rect x="6" y="23" width="20" height="5" fill="#0D131A" />
          <rect x="7" y="24" width="3" height="3" fill="#00D4C8" />
          <rect x="11" y="24" width="2" height="3" fill="#16B853" />
          <rect x="15" y="25" width="10" height="2" fill="#FFFFFF" />
        </svg>
      )}

      {variant === 4 && (
        /* 04: Content, Stage Presentation & Precision Finance */
        <svg viewBox="0 0 32 32" className="w-36 h-36 relative z-10" shapeRendering="crispEdges">
          {/* Broadcast Microphone */}
          <rect x="5" y="4" width="8" height="12" fill="#FFFFFF" />
          <rect x="6" y="5" width="6" height="10" fill="#E5252A" />
          <rect x="6" y="7" width="6" height="1" fill="#080A0D" />
          <rect x="6" y="10" width="6" height="1" fill="#080A0D" />
          <rect x="6" y="13" width="6" height="1" fill="#F0E808" />
          {/* Mic cradle & stand */}
          <path
            fill="#FFFFFF"
            d="M3 12h2v5h8v-5h2v6h-2v2h-3v6h4v2H4v-2h4v-6H5v-2H3v-6z"
          />
          {/* Rising championship presentation chart */}
          <rect x="17" y="20" width="3" height="8" fill="#FFFFFF" />
          <rect x="21" y="15" width="3" height="13" fill="#00D4C8" />
          <rect x="25" y="9" width="4" height="19" fill="#16B853" />
          <rect x="26" y="10" width="1" height="17" fill="#FFFFFF" />
          {/* Star / peak spark */}
          <rect x="26" y="4" width="3" height="3" fill="#F0E808" />
          <rect x="18" y="8" width="4" height="2" fill="#E5252A" />
          <rect x="18" y="11" width="2" height="2" fill="#00D4C8" />
        </svg>
      )}
    </div>
  )
}

/**
 * Super-animated Locked Chromatic Pixel Question Mark for Member #5 ("به‌زودی...").
 * Directly echoes the RGB/CMY + green pixel step aesthetic of `logo-event.png`!
 */
export const PixelClassifiedMystery: React.FC = () => (
  <div
    className="relative w-full h-full bg-[#06080B] flex items-center justify-center overflow-hidden select-none p-4"
    style={{
      backgroundImage:
        'radial-gradient(circle, rgba(229,37,42,0.22) 1.2px, transparent 1.2px)',
      backgroundSize: '12px 12px',
    }}
    role="img"
    aria-label="عضو پنجم قفل‌شده — علامت سوال پیکسلی"
  >
    {/* Sweeping green CRT radar scan beam */}
    <div
      className="radar-scan-beam absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-[#16B853]/30 to-transparent pointer-events-none"
      aria-hidden="true"
    />
    <div className="absolute inset-0 pixel-scanlines pointer-events-none" aria-hidden="true" />

    {/* Blinking corner lock beacons */}
    <span className="absolute top-3 right-3 w-3 h-3 bg-[#16B853] pixel-blink" />
    <span className="absolute top-3 left-3 w-3 h-3 bg-[#E5252A]" />
    <span className="absolute bottom-3 right-3 w-3 h-3 bg-[#00D4C8]" />
    <span className="absolute bottom-3 left-3 w-3 h-3 bg-[#F0E808]" />

    {/* Chromatic pixel question mark with green outer pixel crown */}
    <svg
      viewBox="0 0 24 26"
      className="w-36 h-36 relative z-10 mystery-flicker"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Green outer pixel accents (matches event logo!) */}
      <rect x="6" y="1" width="12" height="2" fill="#16B853" />
      <rect x="4" y="3" width="2" height="5" fill="#16B853" />
      <rect x="18" y="3" width="2" height="6" fill="#16B853" />
      <rect x="20" y="5" width="3" height="1" fill="#16B853" />
      <rect x="1" y="7" width="3" height="1" fill="#E5252A" />

      {/* Red chromatic left fringe */}
      <path
        fill="#E5252A"
        d="M6 3h11v2h2v6h-2v2h-3v3H9v-4h3v-2h2V6H8v3H5V5h1V3zm3 16h4v4H9v-4z"
      />
      {/* Cyan chromatic right fringe */}
      <path
        fill="#00F0F0"
        d="M8 3h11v2h2v6h-2v2h-3v3h-5v-4h3v-2h2V6h-6v3H7V5h1V3zm3 16h4v4h-4v-4z"
      />
      {/* Pure White foreground pixel ? */}
      <path
        fill="#FFFFFF"
        d="M7 3h11v2h2v6h-2v2h-3v3h-5v-4h3v-2h2V6H9v3H6V5h1V3zm3 16h4v4h-4v-4z"
      />
      {/* Yellow micro-glitch tail */}
      <rect x="14" y="21" width="3" height="1" fill="#F0E808" />
    </svg>
  </div>
)
