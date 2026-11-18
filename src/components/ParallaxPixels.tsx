import React from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { PixelCursorLogo } from './PixelArt'

/**
 * GPU-only parallax pixel shapes floating in the page margins.
 * Subtle enough to never obstruct text, bold enough to tie the whole page
 * to the 8th Event's pixel-art neo-brutalist visual language.
 */
export const ParallaxPixels: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const yFast = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -190])
  const yMedium = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 140])
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -110])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Upper-left stepped red/green pixel cluster */}
      <motion.div
        style={{ y: yFast }}
        className="hidden sm:block absolute top-[19%] left-5 lg:left-12 opacity-85"
      >
        <div className="relative w-12 h-12">
          <span className="absolute top-0 left-0 w-5 h-5 bg-[#E5252A] border-[2.5px] border-black shadow-[-2px_2px_0_#0A0A0A]" />
          <span className="absolute top-5 left-5 w-4 h-4 bg-white border-[2.5px] border-black" />
          <span className="absolute top-1 left-7 w-3 h-3 bg-[#22C55E] border-2 border-black" />
        </div>
      </motion.div>

      {/* Mid-right floating mini pixel cursor logo */}
      <motion.div
        style={{ y: yMedium }}
        className="hidden md:block absolute top-[46%] right-4 lg:right-10 opacity-75"
      >
        <PixelCursorLogo size={38} />
      </motion.div>

      {/* Lower-left L-tetromino pixel block */}
      <motion.div
        style={{ y: ySlow }}
        className="hidden sm:block absolute top-[72%] left-4 lg:left-14 opacity-80"
      >
        <div className="relative w-12 h-12">
          <span className="absolute top-0 left-0 w-4 h-4 bg-[#0A0A0A]" />
          <span className="absolute top-4 left-0 w-4 h-4 bg-[#E5252A] border-2 border-black" />
          <span className="absolute top-4 left-4 w-4 h-4 bg-[#E5252A] border-2 border-black" />
          <span className="absolute top-0 left-6 w-3 h-3 bg-[#22C55E] border-2 border-black" />
        </div>
      </motion.div>

      {/* Mobile-friendly subtle edge pixel dots */}
      <motion.div
        style={{ y: ySlow }}
        className="absolute top-[33%] left-2.5 sm:hidden opacity-75"
      >
        <span className="block w-3 h-3 bg-[#22C55E] border-2 border-black mb-1.5" />
        <span className="block w-3.5 h-3.5 bg-[#E5252A] border-2 border-black translate-x-2" />
      </motion.div>

      <motion.div
        style={{ y: yMedium }}
        className="absolute top-[64%] right-2.5 sm:hidden opacity-75"
      >
        <span className="block w-3.5 h-3.5 bg-[#E5252A] border-2 border-black mb-1.5" />
        <span className="block w-2.5 h-2.5 bg-[#22C55E] border-2 border-black -translate-x-2" />
      </motion.div>
    </div>
  )
}
