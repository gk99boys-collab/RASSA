import { useEffect, useRef, type PointerEvent } from 'react'
import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { Clapperboard, Pause, Play } from 'lucide-react'
import { useSiteMotion } from '../../motion/MotionPreferences'
import { useReel } from '../../motion/useReel'
import { formatOrderBadge } from '../../lib/supabase'
import { EventLogo, RasaLogo } from '../BrandMarks'
import { PosterPlates } from './PosterPlates'

const FRAMES = [
  { name: 'می‌رسیم', kicker: 'دوره هشتم', lines: ['رویداد ملی', 'تولید محتوای', 'دیجیتال بسیج'], note: 'نرم‌افزارهای ویژه تلفن همراه' },
  { name: 'می‌سازیم', kicker: 'رشته تلفن همراه', lines: ['از ایده', 'تا ساخت', 'اپلیکیشن'], note: 'طراحی و توسعه با تیم رَسا' },
  { name: 'می‌درخشیم', kicker: 'افتخار تیم', lines: ['رتبه اول', 'شهرستان', 'خوسف'], note: 'مرحله شهرستانی دوره هفتم' },
] as const

// A closed score: flight → tap the phone → salute the medal → return to the first pose.
const CUES = [0, .28, .67, .92, 1.21, 1.48, 1.57, 1.78, 1.96, 2.22, 2.64, 2.88, 3]
const smooth = { ease: (n: number) => n * n * (3 - 2 * n) }
function CursorTrack({ time }: { time: MotionValue<number> }) {
  const x = useTransform(time, CUES, ['0%', '8%', '-2%', '-6%', '-29%', '-33%', '-30%', '-25%', '-18%', '50%', '55%', '46%', '0%'], smooth)
  const y = useTransform(time, CUES, ['4%', '-8%', '-4%', '1%', '20%', '23%', '24%', '20%', '10%', '-27%', '-24%', '-21%', '4%'], smooth)
  const rotate = useTransform(time, CUES, [-13, -19, -9, -12, -23, -25, -20, -23, -18, -12, -5, -10, -13], smooth)
  const scale = useTransform(time, CUES, [1, 1.05, 1.01, .98, .47, .47, .39, .46, .44, .38, .4, .48, 1], smooth)
  return <motion.div className="cursor-print" style={{ x, y, rotate, scale }}><EventLogo className="poster-cursor" /></motion.div>
}

function FrameKey({ index, current, time, seek }: { index: number; current: number; time: MotionValue<number>; seek: (n: number) => void }) {
  const fill = useTransform(time, [index, index + 1], [0, 1])
  const label = `قاب ${formatOrderBadge(index + 1)}: ${FRAMES[index].name}`
  return <button type="button" className="frame-key" onClick={() => seek(index)} aria-label={label} title={label} aria-pressed={current === index}>
    <span>{formatOrderBadge(index + 1)}</span><i className="reel-rail"><motion.i style={{ scaleX: fill }} /></i>
  </button>
}

export function MotionPoster({ ready }: { ready: boolean }) {
  const { enabled } = useSiteMotion()
  const ref = useRef<HTMLElement>(null)
  const { time, frame, paused, running, seek, toggle } = useReel(ref, FRAMES.length, enabled && ready)
  const shot = FRAMES[frame]
  const pitch = useSpring(0, { stiffness: 200, damping: 24 })
  const yaw = useSpring(0, { stiffness: 200, damping: 24 })
  const depthX = useTransform(yaw, [-5, 5], [7, -7])
  const stamp = useTransform(time, [0, .86, 1.14, 1.92, 2.17, 2.32, 3], [1, 1, .01, .01, 1.12, .98, 1], smooth)
  const stampAngle = useTransform(time, [0, 1, 2, 2.22, 3], [7, 3, -9, 9, 7], smooth)

  function track(e: PointerEvent<HTMLDivElement>) {
    if (!running || e.pointerType !== 'mouse') return
    const box = e.currentTarget.getBoundingClientRect() // the hit area itself never tilts
    yaw.set(10 * ((e.clientX - box.left) / box.width - .5))
    pitch.set(-8 * ((e.clientY - box.top) / box.height - .5))
  }
  function center() { yaw.set(0); pitch.set(0) }
  useEffect(() => {
    if (!running) { yaw.jump(0); pitch.jump(0) }
  }, [running, yaw, pitch])

  return <figure ref={ref} className="poster reel" aria-label="موشن‌پوستر رَسا در رویداد هشتم" data-running={running}>
    <figcaption><span><Clapperboard size={13} aria-hidden="true" />موشن‌پوستر رویداد هشتم</span>
      <span className="poster-serial mono" dir="ltr" aria-hidden="true"><i className="barcode" />R–08</span></figcaption>
    <div className="poster-window" onPointerMove={track} onPointerLeave={center} onPointerCancel={center}>
      <motion.div className="poster-art" aria-hidden="true" style={{ rotateX: pitch, rotateY: yaw }}>
        <span className="poster-edition mono" dir="ltr">RASSA × 08</span>
        <motion.span className="poster-eight" dir="ltr" style={{ x: depthX }}>08</motion.span>
        <PosterPlates frame={frame} time={time} />
        <i className="reg-mark reg-tl" /><i className="reg-mark reg-tr" /><i className="reg-mark reg-bl" /><i className="reg-mark reg-br" />
        <div key={frame} className="poster-type"><span className="poster-kicker">{shot.kicker}</span>
          <strong>{shot.lines.map((line) => <span className="ink-mask" key={line}><span>{line}</span></span>)}</strong>
        </div>
        <CursorTrack time={time} />
        <motion.div className="poster-stamp" style={{ scale: stamp, rotate: stampAngle }}><RasaLogo className="stamp-logo" /></motion.div>
        <span className="poster-code">{shot.note}</span>
      </motion.div>
    </div>
    <div className="reel-console" role="group" aria-label="کنترل موشن‌پوستر">
      {enabled ? <button type="button" className="transport-key" onClick={toggle} aria-label={paused ? 'پخش پوستر' : 'مکث پوستر'} title={paused ? 'پخش پوستر' : 'مکث پوستر'}>
        {paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
      </button> : <span className="still-key" aria-label="نمایش ثابت"><Clapperboard size={15} /></span>}
      <span className="reel-label"><small>قاب {formatOrderBadge(frame + 1)}</small><strong>{shot.name}</strong></span>
      <div className="reel-keys">{FRAMES.map(({ name }, i) => <FrameKey key={name} index={i} current={frame} time={time} seek={seek} />)}</div>
    </div>
  </figure>
}
