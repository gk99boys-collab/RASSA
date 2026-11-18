const asset = (name: string) => `${import.meta.env.BASE_URL}${name}.png`
type MarkProps = { className?: string; alt?: string }

export function RasaLogo({ className = '', alt = 'لوگوی تیم رَسا' }: MarkProps) {
  return <img src={asset('logo-rasa')} width={960} height={645} alt={alt} className={`object-contain ${className}`} decoding="async" draggable={false} />
}

export function RasaMark({ className = '', alt = '' }: MarkProps) {
  return <img src={asset('logo-rasa-mark')} width={512} height={242} alt={alt} className={`object-contain ${className}`} decoding="async" draggable={false} />
}

export function EventLogo({ className = '', alt = '' }: MarkProps) {
  return <img src={asset('logo-event')} width={473} height={640} alt={alt} className={`object-contain ${className}`} decoding="async" draggable={false} style={{ imageRendering: 'pixelated' }} />
}
