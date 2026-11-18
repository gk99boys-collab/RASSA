import { motion, useTransform, type MotionValue } from 'framer-motion'

/** All three plates share a 500 × 270 print bed. The type and official cursor sit above the ink. */
const rosette = Array.from({ length: 32 }, (_, i) => {
  const angle = i * Math.PI / 16
  const r = i % 2 ? 62 : 72
  return `${(365 + Math.cos(angle) * r).toFixed(1)},${(117 + Math.sin(angle) * r).toFixed(1)}`
}).join(' ')

export function PosterPlates({ frame, time }: { frame: number; time: MotionValue<number> }) {
  const orbit = useTransform(time, [0, 1], [-12, 22])
  const lift = useTransform(time, [1, 1.35, 1.7, 2], [10, -4, 0, 4])
  const rays = useTransform(time, [2, 2.55, 3], [-9, 4, 12])
  return <svg className="poster-plates" viewBox="0 0 500 270" preserveAspectRatio="none" aria-hidden="true">
    {frame === 0 && <g className="ink-plate">
      <path d="M226 263C319 233 220 138 347 136S487 66 466 21" fill="none" stroke="#ffd9cc" strokeWidth="1.1" strokeDasharray="4 5" />
      <motion.g style={{ rotate: orbit, transformOrigin: '366px 138px' }}>
        <g transform="rotate(-28 366 138)" fill="none" stroke="#ffb7a8">
          <ellipse cx="366" cy="138" rx="96" ry="63" strokeWidth="1.2" />
          <ellipse cx="366" cy="138" rx="104" ry="70" strokeDasharray="1 6" />
          <rect x="265" y="133" width="10" height="10" fill="#a0f5b5" stroke="#161616" />
          <rect x="457" y="134" width="7" height="7" fill="#fff4e5" stroke="#161616" />
        </g>
      </motion.g>
      <path d="M263 212h10m-5-5v10M435 62h10m-5-5v10" fill="none" stroke="#ffe5d7" />
    </g>}
    {frame === 1 && <g className="ink-plate">
      <path d="M263 76h29l20-19h71M406 186l17 18h39" fill="none" stroke="#ffd1bc" strokeDasharray="3 3" />
      <motion.g style={{ y: lift }}><g transform="rotate(-8 365 135)">
        <rect x="307" y="46" width="119" height="183" rx="10" fill="#791324" />
        <rect x="300" y="39" width="119" height="183" rx="10" fill="#f9f5e9" stroke="#171619" strokeWidth="3.5" />
        <rect x="307" y="57" width="105" height="142" rx="2" fill="#e0f3e9" stroke="#171619" strokeWidth="1.6" />
        <path d="M344 48h28M348 209h23" stroke="#201f20" strokeWidth="3" strokeLinecap="round" />
        <path d="M314 66h8m-8 0v8m89 116h-8m8 0v-8" stroke="#238780" fill="none" />
        <image href={`${import.meta.env.BASE_URL}logo-rasa.png`} x="324" y="84" width="72" height="50" />
        <path d="M324 150h72m-58 8h44" stroke="#6d9892" strokeWidth="2" />
        <rect x="343" y="170" width="33" height="8" fill="#24ae67" stroke="#172922" />
      </g></motion.g>
    </g>}
    {frame === 2 && <g className="ink-plate">
      <motion.g stroke="#ffe2b8" style={{ rotate: rays, transformOrigin: '365px 117px' }}>
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={i % 2 ? 'M365 30v-6' : 'M365 34V18'} transform={`rotate(${i * 360 / 14} 365 117)`} strokeWidth={i % 2 ? 1 : 2} />)}
      </motion.g>
      <g transform="rotate(7 365 117)" stroke="#171619" strokeWidth="2.6" strokeLinejoin="round">
        <path d="m331 149-13 69 23-13 16 21 14-69" fill="#9aefb0" /><path d="m360 157 15 66 15-20 22 10-16-68" fill="#f5ddbc" />
        <polygon points={rosette} transform="translate(4 5)" fill="#181718" /><polygon points={rosette} fill="#fff3d9" />
        <circle cx="365" cy="117" r="49" fill="none" strokeWidth="1.3" strokeDasharray="2 3" />
        <text x="365" y="144" textAnchor="middle" fill="#cf1a2c" stroke="none" fontFamily="Vazirmatn, sans-serif" fontSize="83" fontWeight="900">۱</text>
      </g>
    </g>}
  </svg>
}
