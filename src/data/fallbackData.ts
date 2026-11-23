import type { Member, Team } from '../types'

export const FALLBACK_TEAM: Team = {
  id: 'local-team-rasa',
  name: 'رَسا',
  tagline: 'رَسا؛ می‌رسیم، می‌سازیم، می‌درخشیم',
  description:
    'تیم رَسا با بهره‌گیری از بهترین و به‌روزترین ابزارهای طراحی اپلیکیشن و سایت پا به این میدان گذاشته تا مثل دوره‌ی هفتم دوباره بدرخشد و مقام نخست را از آنِ خود کند.',
  achievement_text: 'رتبه‌ی اول مرحله‌ی شهرستانی (خوسف) در دوره‌ی هفتم',
  links: [],
}

// Personal facts (study, experience, personal sites) come from the team's
// own profile sheet; roles stay the in-team jobs so each card keeps its
// illustrated jacket. Photos live in public/member-photos/.
export const FALLBACK_MEMBERS: Member[] = [
  {
    id: 'local-member-1',
    sort_order: 1,
    name: 'مجتبی میدانی',
    role: 'سرپرست تیم و فرانت‌اندکار',
    skills: ['فرانت‌اند', 'طراحی گرافیک', 'طراحی وب‌سایت', 'مدیریت پروژه'],
    bio: 'دانشجوی رشته نرم‌افزار در مقطع کاردانی دانشگاه ملی مهارت ابن‌حسام؛ با ۵ سال سابقه طراحی گرافیک و طراحی وب‌سایت. فرانت‌اندکار و سرپرست تیم؛ هماهنگی، زمان‌بندی و تصمیم‌های نهایی با اوست.',
    photo_url: './member-photos/mojtaba.jpg',
    links: [{ label: 'سایت شخصی', url: 'https://b2n.ir/up5494', type: 'website' }],
    education: 'کاردانی نرم‌افزار — دانشگاه ملی مهارت ابن‌حسام',
    experience: '۵ سال سابقه طراحی گرافیک و وب‌سایت',
  },
  {
    id: 'local-member-2',
    sort_order: 2,
    name: 'محمد صحرانورد',
    role: 'توسعه‌دهنده موبایل و ادیتور',
    skills: ['عکاسی حرفه‌ای با موبایل', 'سناریونویسی', 'طراحی گرافیک', 'ادیتوری حرفه‌ای'],
    bio: 'هنرجوی رشته تولید محتوا و انیمیشن در هنرستان کاردانش امام حسین (ع) شهرستان خوسف؛ عکاس حرفه‌ای با موبایل، سناریونویس، طراح گرافیک و ادیتور حرفه‌ای با ۳ سال سابقه طراحی گرافیک حرفه‌ای و تخصصی. ایده‌ها را روی صفحه‌ی گوشی زنده می‌کند.',
    photo_url: './member-photos/mohammad.jpg',
    links: [{ label: 'سایت تخصصی', url: 'https://b2n.ir/mohammad', type: 'website' }],
    education: 'تولید محتوا و انیمیشن — هنرستان کاردانش امام حسین (ع)، خوسف',
    experience: '۳ سال سابقه طراحی گرافیک حرفه‌ای',
  },
  {
    id: 'local-member-3',
    sort_order: 3,
    name: 'سید ابوالفضل میرزازاده',
    role: 'بک‌اندکار و پشتیبان‌گیری',
    skills: ['بک‌اند', 'پشتیبان‌گیری', 'طراحی گرافیک'],
    bio: 'دانشجوی رشته نرم‌افزار در مقطع کاردانی دانشگاه آزاد اسلامی بیرجند؛ با ۵ سال سابقه طراحی گرافیک، بک‌اندکار و پشتیبان‌گیری. مغز پنهان اپلیکیشن؛ سرور و داده‌ها زیر دست اوست.',
    photo_url: './member-photos/abolfazl.jpg',
    links: [],
    education: 'کاردانی نرم‌افزار — دانشگاه آزاد اسلامی بیرجند',
    experience: '۵ سال سابقه طراحی گرافیک و بک‌اند',
  },
  {
    id: 'local-member-4',
    sort_order: 4,
    name: 'علیرضا حاجی‌زاده',
    role: 'مسئول محتوا و ارائه',
    skills: ['حسابداری شرکتی و خصوصی', 'تولید محتوا', 'ارائه'],
    bio: 'دانشجوی رشته حسابداری در مقطع کاردانی دانشگاه ملی مهارت ابن‌حسام؛ با ۵ سال سابقه حسابداری شرکتی و خصوصی و قدرت تولید و ارائه محتوا. صدای تیم در برابر داوران.',
    photo_url: './member-photos/alireza.jpg',
    links: [],
    education: 'کاردانی حسابداری — دانشگاه ملی مهارت ابن‌حسام',
    experience: '۵ سال سابقه حسابداری شرکتی و خصوصی',
  },
  {
    id: 'local-member-5',
    sort_order: 5,
    name: 'به‌زودی...',
    role: 'عضو پنجم',
    skills: [],
    bio: 'عضو پنجم رَسا به‌زودی معرفی می‌شود.',
    photo_url: null,
    links: [],
  },
]
