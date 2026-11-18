import React from 'react'

interface PixelCursorLogoProps {
  size?: number
  className?: string
  showClickSparks?: boolean
  title?: string
}

/**
 * Signature 8th National Basij Digital Content Production Event motif:
 * Red & white pixel-art mouse cursor arrow with thick black pixel border
 * and floating #22C55E green pixel dots.
 */
export const PixelCursorLogo: React.FC<PixelCursorLogoProps> = ({
  size = 44,
  className = '',
  showClickSparks = false,
  title,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`select-none shrink-0 ${className}`}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      {/* Signature floating green pixel dots (#22C55E with crisp black pixel frame) */}
      <rect x="15" y="1" width="4" height="4" fill="#0A0A0A" />
      <rect x="16" y="2" width="2" height="2" fill="#22C55E" />

      <rect x="19" y="5" width="4" height="4" fill="#0A0A0A" />
      <rect x="20" y="6" width="2" height="2" fill="#22C55E" />

      <rect x="17" y="10" width="2" height="2" fill="#22C55E" />
      <rect x="1" y="20" width="2" height="2" fill="#22C55E" />

      {/* Optional extra click burst sparks */}
      {showClickSparks && (
        <>
          <rect x="0" y="1" width="2" height="2" fill="#22C55E" />
          <rect x="5" y="0" width="2" height="2" fill="#E5252A" />
          <rect x="0" y="6" width="2" height="2" fill="#E5252A" />
          <rect x="9" y="1" width="2" height="2" fill="#22C55E" />
        </>
      )}

      {/* Hard offset pixel drop shadow */}
      <path
        fill="#0A0A0A"
        fillOpacity="0.22"
        d="M2 4h2v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v3h-4v1h1v2h1v3H8v-2H7v-2H6v-1H5v1H4v1H2V4z"
      />

      {/* Stepped 1px black pixel outline of cursor arrow */}
      <path
        fill="#0A0A0A"
        d="M3 2h2v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v3h-4v1h1v2h1v3H9v-2H8v-2H7v-1H6v1H5v1H3V2z"
      />

      {/* Strong red (#E5252A) primary arrow body */}
      <path
        fill="#E5252A"
        d="M4 4h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H9v2h1v2h1v2h-1v-2H9v-2H8v-1H6v1H5v1H4V4z"
      />

      {/* Crisp white pixel inner bevel / two-tone highlight */}
      <path
        fill="#FFFFFF"
        d="M4 4h1v12H4V4zm1 1h1v10H5V5zm1 1h1v2H6V6zm1 1h1v2H7V7zm1 1h1v1H8V8z"
      />

      {/* Tiny green pixel spark at tail */}
      <rect x="14" y="19" width="3" height="3" fill="#0A0A0A" />
      <rect x="15" y="20" width="1" height="1" fill="#22C55E" />
    </svg>
  )
}

/**
 * Pixel-art #1 Champion Medal for the Achievement section.
 * Strictly follows the black + strong red (#E5252A) + white + pixel green (#22C55E) palette.
 */
export const PixelMedal: React.FC<{ size?: number; className?: string }> = ({
  size = 112,
  className = '',
}) => (
  <svg
    width={size}
    height={Math.round((size * 28) / 24)}
    viewBox="0 0 24 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`select-none shrink-0 ${className}`}
    role="img"
    aria-label="مدال پیکسلی رتبه اول"
  >
    {/* Floating celebratory green & red pixel sparks */}
    <rect x="1" y="11" width="2" height="2" fill="#22C55E" />
    <rect x="21" y="10" width="2" height="2" fill="#22C55E" />
    <rect x="2" y="23" width="2" height="2" fill="#E5252A" />
    <rect x="20" y="24" width="2" height="2" fill="#22C55E" />

    {/* Neck Ribbon (Black pixel outline + Red & White stripes) */}
    <path
      fill="#0A0A0A"
      d="M4 1h6v2h1v2h2V3h1V1h6v5h-1v2h-1v2h-2v1H8v-1H6V8H5V6H4V1z"
    />
    <path fill="#E5252A" d="M5 2h4v2h1v3h1v2H8V8H7V6H6V4H5V2z" />
    <path fill="#FFFFFF" d="M6 2h1v3H6V2z" />
    <path fill="#E5252A" d="M15 2h4v2h-1v2h-1v2h-1v1h-3V7h1V4h1V2z" />
    <path fill="#FFFFFF" d="M17 2h1v3h-1V2z" />

    {/* Green pixel clasp */}
    <rect x="10" y="9" width="4" height="2" fill="#0A0A0A" />
    <rect x="11" y="9" width="2" height="2" fill="#22C55E" />

    {/* Hard offset shadow under medal */}
    <path
      fill="#0A0A0A"
      d="M7 12h8v1h2v2h1v8h-1v2h-2v1H7v-1H5v-2H4v-8h1v-2h2v-1z"
    />

    {/* Medal Disc Outer Black Pixel Rim */}
    <path
      fill="#0A0A0A"
      d="M8 11h8v1h2v2h1v8h-1v2h-2v1H8v-1H6v-2H5v-8h1v-2h2v-1z"
    />

    {/* Medal Red Outer Ring */}
    <path
      fill="#E5252A"
      d="M8 12h8v1h1v1h1v8h-1v1h-1v1H8v-1H7v-1H6v-8h1v-1h1v-1z"
    />

    {/* Crisp White Inner Face */}
    <path
      fill="#FFFFFF"
      d="M9 14h6v1h1v6h-1v1H9v-1H8v-6h1v-1z"
    />

    {/* Pixel Highlight Gleam */}
    <rect x="7" y="13" width="2" height="1" fill="#FFFFFF" />
    <rect x="7" y="14" width="1" height="2" fill="#FFFFFF" />

    {/* Bold Pixel "1" / "۱" Champion Emblem in Center */}
    <rect x="11" y="15" width="2" height="6" fill="#0A0A0A" />
    <rect x="10" y="16" width="1" height="1" fill="#0A0A0A" />
    <rect x="10" y="20" width="4" height="1" fill="#E5252A" />
    <rect x="14" y="15" width="1" height="1" fill="#22C55E" />
  </svg>
)

/**
 * Custom neo-brutalist pixel-art fallback avatars for Members 1..4
 * (shown until real photos are uploaded to Supabase Storage `member-photos`).
 */
export const PixelMemberAvatar: React.FC<{ sortOrder: number; name: string }> = ({
  sortOrder,
  name,
}) => {
  const variant = ((sortOrder - 1) % 4) + 1

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-[#F1F2F4] overflow-hidden select-none"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(10,10,10,0.18) 1.25px, transparent 1.25px)',
        backgroundSize: '12px 12px',
      }}
      role="img"
      aria-label={`آواتار پیکسلی ${name}`}
    >
      {/* Corner green & red pixel accents */}
      <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#22C55E] border-2 border-black" />
      <span className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 bg-[#E5252A] border-2 border-black" />

      {variant === 1 && (
        /* Captain / PM & Creative Director: Pixel Flagship Crown + Design Window */
        <svg viewBox="0 0 24 24" className="w-24 h-24 sm:w-28 sm:h-28" shapeRendering="crispEdges">
          {/* Pixel Crown */}
          <path
            fill="#0A0A0A"
            d="M4 3h2v2h2v1h2V4h1V2h2v2h1v2h2V5h2V3h2v8H4V3z"
          />
          <path
            fill="#E5252A"
            d="M5 5h1v1h2v1h2V5h1V4h2v1h1v2h2V6h2V5h1v4H5V5z"
          />
          <rect x="11" y="6" width="2" height="2" fill="#FFFFFF" />
          <rect x="7" y="7" width="1" height="1" fill="#22C55E" />
          <rect x="16" y="7" width="1" height="1" fill="#22C55E" />
          {/* Storyboard / Project Board */}
          <rect x="3" y="12" width="18" height="10" fill="#0A0A0A" />
          <rect x="4" y="13" width="16" height="8" fill="#FFFFFF" />
          <rect x="5" y="14" width="5" height="2" fill="#E5252A" />
          <rect x="11" y="14" width="4" height="2" fill="#0A0A0A" />
          <rect x="16" y="14" width="3" height="2" fill="#22C55E" />
          <rect x="5" y="18" width="9" height="2" fill="#0A0A0A" />
          <rect x="15" y="18" width="4" height="2" fill="#E5252A" />
        </svg>
      )}

      {variant === 2 && (
        /* Mobile Developer: Pixel Smartphone + Red App Blocks + Cursor */
        <svg viewBox="0 0 24 24" className="w-24 h-24 sm:w-28 sm:h-28" shapeRendering="crispEdges">
          <rect x="5" y="2" width="14" height="20" fill="#0A0A0A" />
          <rect x="6" y="4" width="12" height="15" fill="#FFFFFF" />
          {/* Speaker notch */}
          <rect x="10" y="3" width="4" height="1" fill="#FFFFFF" />
          {/* App UI inside phone */}
          <rect x="7" y="5" width="10" height="4" fill="#E5252A" />
          <rect x="8" y="6" width="3" height="2" fill="#FFFFFF" />
          <rect x="7" y="10" width="4" height="4" fill="#0A0A0A" />
          <rect x="12" y="10" width="5" height="2" fill="#22C55E" />
          <rect x="12" y="13" width="5" height="1" fill="#0A0A0A" />
          <rect x="7" y="15" width="10" height="3" fill="#E5252A" />
          {/* Home bar */}
          <rect x="10" y="20" width="4" height="1" fill="#22C55E" />
          {/* Floating pixel sparks */}
          <rect x="2" y="6" width="2" height="2" fill="#E5252A" />
          <rect x="20" y="14" width="2" height="2" fill="#22C55E" />
        </svg>
      )}

      {variant === 3 && (
        /* Backend & Database Developer: Pixel 3-Tier Server Rack + Green Status LEDs */
        <svg viewBox="0 0 24 24" className="w-24 h-24 sm:w-28 sm:h-28" shapeRendering="crispEdges">
          {/* Rack Unit 1 */}
          <rect x="3" y="3" width="18" height="6" fill="#0A0A0A" />
          <rect x="4" y="4" width="16" height="4" fill="#FFFFFF" />
          <rect x="5" y="5" width="2" height="2" fill="#22C55E" />
          <rect x="8" y="5" width="2" height="2" fill="#E5252A" />
          <rect x="13" y="5" width="6" height="2" fill="#0A0A0A" />
          {/* Rack Unit 2 */}
          <rect x="3" y="10" width="18" height="6" fill="#0A0A0A" />
          <rect x="4" y="11" width="16" height="4" fill="#E5252A" />
          <rect x="5" y="12" width="2" height="2" fill="#FFFFFF" />
          <rect x="8" y="12" width="2" height="2" fill="#22C55E" />
          <rect x="13" y="12" width="6" height="2" fill="#0A0A0A" />
          {/* Rack Unit 3 */}
          <rect x="3" y="17" width="18" height="5" fill="#0A0A0A" />
          <rect x="4" y="18" width="16" height="3" fill="#FFFFFF" />
          <rect x="5" y="19" width="2" height="1" fill="#22C55E" />
          <rect x="8" y="19" width="5" height="1" fill="#0A0A0A" />
          <rect x="15" y="19" width="4" height="1" fill="#E5252A" />
        </svg>
      )}

      {variant === 4 && (
        /* Content, Pitch & Accounting: Pixel Microphone + Precision Chart Bars */
        <svg viewBox="0 0 24 24" className="w-24 h-24 sm:w-28 sm:h-28" shapeRendering="crispEdges">
          {/* Pixel Microphone */}
          <rect x="5" y="3" width="6" height="9" fill="#0A0A0A" />
          <rect x="6" y="4" width="4" height="7" fill="#E5252A" />
          <rect x="6" y="6" width="4" height="1" fill="#0A0A0A" />
          <rect x="6" y="8" width="4" height="1" fill="#FFFFFF" />
          <path fill="#0A0A0A" d="M3 9h2v4h6V9h2v5h-2v1H9v4h3v2H4v-2h3v-4H5v-1H3V9z" />
          {/* Rising precision pitch bars */}
          <rect x="14" y="15" width="3" height="6" fill="#0A0A0A" />
          <rect x="15" y="16" width="1" height="4" fill="#FFFFFF" />
          <rect x="18" y="9" width="4" height="12" fill="#0A0A0A" />
          <rect x="19" y="10" width="2" height="10" fill="#22C55E" />
          <rect x="15" y="5" width="2" height="2" fill="#22C55E" />
          <rect x="19" y="5" width="2" height="2" fill="#E5252A" />
        </svg>
      )}
    </div>
  )
}

/**
 * Locked Pixel Question Mark for the 5th Mystery Member card.
 */
export const PixelMysteryMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative w-full h-full flex items-center justify-center bg-[#111111] pixel-scanlines overflow-hidden select-none ${className}`}
    role="img"
    aria-label="عضو پنجم قفل شده - علامت سوال پیکسلی"
  >
    {/* Corner green & red pixel markers */}
    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#22C55E] pixel-blink" />
    <span className="absolute top-3 left-3 w-2.5 h-2.5 bg-[#E5252A]" />
    <span className="absolute bottom-3 right-3 w-2.5 h-2.5 bg-[#E5252A]" />
    <span className="absolute bottom-3 left-3 w-2.5 h-2.5 bg-[#22C55E]" />

    {/* Glitch ghost layers + main pixel question mark */}
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 mystery-flicker">
      {/* Green chromatic offset */}
      <svg
        viewBox="0 0 20 20"
        className="absolute inset-0 w-full h-full translate-x-1 -translate-y-0.5 opacity-80"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <path
          fill="#22C55E"
          d="M6 3h8v1h2v5h-1v1h-2v1h-2v2H9v-3h2V9h2V5H7v3H5V4h1V3zm3 12h2v2H9v-2z"
        />
      </svg>

      {/* Red offset block */}
      <svg
        viewBox="0 0 20 20"
        className="absolute inset-0 w-full h-full -translate-x-1 translate-y-1"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <path
          fill="#E5252A"
          d="M6 3h8v1h2v5h-1v1h-2v1h-2v2H9v-3h2V9h2V5H7v3H5V4h1V3zm3 12h2v2H9v-2z"
        />
      </svg>

      {/* Crisp foreground white question mark */}
      <svg
        viewBox="0 0 20 20"
        className="relative w-full h-full"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <path
          fill="#FFFFFF"
          d="M6 3h8v1h2v5h-1v1h-2v1h-2v2H9v-3h2V9h2V5H7v3H5V4h1V3zm3 12h2v2H9v-2z"
        />
      </svg>
    </div>
  </div>
)
