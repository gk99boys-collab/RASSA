import React, { useMemo } from 'react'
import type { Member } from '../types'
import { PixelCursorLogo } from './PixelArt'

interface SkillsMarqueeProps {
  members: Member[]
}

const DEFAULT_SKILLS = [
  'نرم‌افزارهای ویژه تلفن همراه',
  'توسعه موبایل',
  'مدیریت پروژه',
  'بک‌اند',
  'پایگاه داده',
  'طراحی گرافیک',
  'طراحی سایت',
  'تولید محتوا و انیمیشن',
  'ارائه حرفه‌ای',
  'حسابداری شرکتی',
]

/**
 * Full-bleed neo-brutalist scrolling marquee ticker of team skills
 * punctuated by the event's pixel cursor arrow & green pixel blocks.
 */
export const SkillsMarquee: React.FC<SkillsMarqueeProps> = ({ members }) => {
  const skills = useMemo(() => {
    const collected = new Set<string>(['نرم‌افزارهای ویژه تلفن همراه'])
    for (const member of members) {
      for (const skill of member.skills) {
        const clean = skill.trim()
        if (clean) collected.add(clean)
      }
    }
    const list = Array.from(collected)
    return list.length >= 5 ? list : DEFAULT_SKILLS
  }, [members])

  const renderGroup = (groupKey: string, ariaHidden?: boolean) => (
    <div
      key={groupKey}
      aria-hidden={ariaHidden}
      className="flex items-center shrink-0"
    >
      {skills.map((skill, idx) => (
        <div key={`${groupKey}-${skill}-${idx}`} className="flex items-center shrink-0">
          <span
            dir="rtl"
            className="mx-3 inline-flex items-center gap-2 bg-white text-[#0A0A0A] border-[2.5px] border-white font-black text-sm sm:text-base px-3.5 py-1 rounded-[5px] shadow-[-3px_3px_0_#E5252A]"
          >
            <span
              className={`w-2.5 h-2.5 shrink-0 ${
                idx % 2 === 0 ? 'bg-[#22C55E]' : 'bg-[#E5252A]'
              }`}
            />
            <span>{skill}</span>
          </span>
          <PixelCursorLogo size={24} className="mx-1 shrink-0" />
        </div>
      ))}
    </div>
  )

  return (
    <div
      aria-label="نوار مهارت‌های تیم رَسا"
      className="rasa-marquee-wrap relative z-10 bg-[#0A0A0A] border-y-[3px] border-[#0A0A0A] py-3.5 overflow-hidden select-none"
    >
      {/* Top red neo-brutalist rule */}
      <div className="absolute top-0 inset-x-0 h-[4px] bg-[#E5252A]" aria-hidden="true" />

      {/* dir="ltr" ensures exact -50% loop synchronization while inner chips keep dir="rtl" */}
      <div dir="ltr" className="rasa-marquee-track">
        {renderGroup('a', false)}
        {renderGroup('b', true)}
      </div>
    </div>
  )
}
