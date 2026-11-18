import React from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { EventCursorLogo } from './BrandAssets'

/**
 * Multi-layer 60fps scroll-parallax pixel blocks & official event cursors
 * creating continuous architectural depth along the page edges.
 */
export const ParallaxPixels: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })

  const yLayer1 = useTransform(smooth, [0, 1], [0, shouldReduceMotion ? 0 : -260])
  const yLayer2 = useTransform(smooth, [0, 1], [0, shouldReduceMotion ? 0 : 210])
  const yLayer3 = useTransform(smooth, [0, 1], [0, shouldReduceMotion ? 0 : -160])
  const rotSlow = useTransform(smooth, [0, 1], [-18, shouldReduceMotion ? -18 : 16])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Top-left chromatic pixel tetromino */}
      <motion.div
        style={{ y: yLayer1 }}
        className="hidden md:block absolute top-[17%] left-5 xl:left-12 opacity-90"
      >
        <div className="relative w-14 h-14">
          <span className="absolute top-0 left-0 w-5 h-5 bg-[#E5252A] border-[3px] border-[#080A0D] shadow-[-3px_3px_0_#080A0D]" />
          <span className="absolute top-5 left-5 w-5 h-5 bg-[#16B853] border-[3px] border-[#080A0D] shadow-[-3px_3px_0_#080A0D]" />
          <span className="absolute top-0 left-8 w-3.5 h-3.5 bg-[#00D4C8] border-2 border-[#080A0D]" />
        </div>
      </motion.div>

      {/* Mid-right floating official 8th Event cursor arrow */}
      <motion.div
        style={{ y: yLayer2, rotate: rotSlow }}
        className="hidden lg:block absolute top-[42%] right-5 xl:right-12 opacity-85 drop-shadow-[-4px_4px_0_rgba(8,10,13,0.45)]"
      >
        <EventCursorLogo className="w-11 h-14" />
      </motion.div>

      {/* Mid-left architectural pixel stair + cyan spark */}
      <motion.div
        style={{ y: yLayer3 }}
        className="hidden lg:block absolute top-[58%] left-6 xl:left-14 opacity-85"
      >
        <div className="relative w-14 h-14">
          <span className="absolute top-0 left-0 w-4 h-4 bg-[#080A0D]" />
          <span className="absolute top-4 left-4 w-5 h-5 bg-white border-[3px] border-[#080A0D] shadow-[-3px_3px_0_#E5252A]" />
          <span className="absolute top-9 left-9 w-3.5 h-3.5 bg-[#F0E808] border-2 border-[#080A0D]" />
        </div>
      </motion.div>

      {/* Lower-right floating mini event cursor */}
      <motion.div
        style={{ y: yLayer1 }}
        className="hidden md:block absolute top-[82%] right-6 xl:right-14 opacity-80"
      >
        <div className="relative w-12 h-12">
          <span className="absolute top-0 right-0 w-5 h-5 bg-[#00D4C8] border-[3px] border-[#080A0D] shadow-[-3px_3px_0_#080A0D]" />
          <span className="absolute top-6 right-5 w-4 h-4 bg-[#E5252A] border-2 border-[#080A0D]" />
          <span className="absolute top-1 right-7 w-3 h-3 bg-[#16B853] border-2 border-[#080A0D]" />
        </div>
      </motion.div>

      {/* Subtle mobile margin pixel accents */}
      <motion.div
        style={{ y: yLayer3 }}
        className="md:hidden absolute top-[30%] left-2 opacity-80"
      >
        <span className="block w-3 h-3 bg-[#16B853] border-2 border-[#080A0D] mb-1.5" />
        <span className="block w-3.5 h-3.5 bg-[#E5252A] border-2 border-[#080A0D] translate-x-2" />
      </motion.div>

      <motion.div
        style={{ y: yLayer2 }}
        className="md:hidden absolute top-[68%] right-2 opacity-80"
      >
        <span className="block w-3.5 h-3.5 bg-[#00D4C8] border-2 border-[#080A0D] mb-1.5" />
        <span className="block w-3 h-3 bg-[#E5252A] border-2 border-[#080A0D] -translate-x-2" />
      </motion.div>
    </div>
  )
}
