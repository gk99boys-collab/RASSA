# وب‌سایت معرفی تیم رَسا (Rasa Team Site)

وب‌سایت تک‌صفحه‌ای، فارسی (RTL) و موبایل‌محور برای معرفی تیم نرم‌افزاری **«رَسا»** در **هشتمین رویداد ملی تولید محتوای دیجیتال بسیج** (رشته‌ی نرم‌افزارهای ویژه تلفن همراه)، با طراحی نئوبروتالیسم و المان‌های پیکسلی هماهنگ با هویت بصری رویداد.

## امکانات و پشته فنی

- **Vite + React 19 + TypeScript + Tailwind CSS v4**
- **هویت بصری رسمی**: لوگوی رسمی تیم **رَسا** (`public/logo-rasa.png` و `public/logo-rasa-mark.png`)، لوگوی رسمی **هشتمین رویداد ملی تولید محتوای دیجیتال بسیج** (`public/logo-event.png`) و فاوآیکون رسمی (`public/favicon.png`)
- **تجربه‌ی تک‌بخشی مینیمال و فوق‌روان (Single-Stage Minimalism)**: نمایش یکپارچه و خلوت تمام اطلاعات در یک قاب تمام‌صفحه (`100dvh`) با انیمیشن‌های نرم مبتنی بر فنر (`Framer Motion` + `layoutId`)، اینتروی مینیمال، هاله‌ی محیطی پویا، جابه‌جایی روان با داک شناور، اسکرول، کیبورد و سوایپ، و پشتیبانی کامل از `prefers-reduced-motion`
- **فونت وزیرمتن (Vazirmatn)** به‌صورت محلی (بدون وابستگی به CDN خارجی)
- **Supabase JS Client** فقط با کلید عمومی (`anon`) و سیاست دسترسی فقط‌خواندنی (`SELECT` RLS) + داده‌ی پشتیبان محلی (Fallback) و اسکلت بارگذاری نئوبروتالیستی

---

## راه‌اندازی محلی (Setup)

```bash
npm install
cp .env.example .env
# مقادیر VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY را در فایل .env قرار دهید
npm run dev
```

ساخت نسخه‌ی نهایی استاتیک:

```bash
npm run build
npm run preview
```

---

## متغیرهای محیطی (Environment Variables)

در فایل `.env` (و در تنظیمات سرویس میزبانی) فقط این دو متغیر را تنظیم کنید:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-public-anon-key>
```

> هرگز کلید `service_role` را در فرانت‌اند یا مخزن گیت قرار ندهید. اگر متغیرها تنظیم نشوند یا ارتباط با Supabase برقرار نباشد، سایت به‌طور خودکار با داده‌ی پشتیبان محلی (`src/data/fallbackData.ts`) به‌صورت کامل نمایش داده می‌شود.

---

## ویرایش اطلاعات و آپلود عکس اعضا در Supabase

اسکیما، سیاست‌های RLS، باکت ذخیره‌سازی و داده‌های اولیه در فایل [`supabase/schema.sql`](./supabase/schema.sql) نیز موجود است.

### ۱. ویرایش اطلاعات تیم (`public.team`)
در داشبورد Supabase به بخش **Table Editor → `team`** بروید و ستون‌های `name`، `tagline`، `description`، `achievement_text` و `links` را ویرایش کنید.

ستون `links` از هر دو فرمت JSON پشتیبانی می‌کند:
```json
[
  { "label": "گیت‌هاب", "url": "https://github.com/...", "type": "github" },
  { "label": "ایتا", "url": "https://eitaa.com/...", "type": "eitaa" }
]
```
یا:
```json
{
  "github": "https://github.com/...",
  "telegram": "https://t.me/..."
}
```

### ۲. آپلود عکس اعضا (`Storage → member-photos`)
1. در داشبورد Supabase به بخش **Storage → `member-photos`** بروید.
2. تصویر هر عضو را آپلود کنید (مثلاً `mojtaba.jpg`).
3. در **Table Editor → `members`** در ستون `photo_url` آن عضو، یا **لینک عمومی کامل (Get URL)** را قرار دهید یا صرفاً نام فایل (`mojtaba.jpg`) را بنویسید؛ سایت به‌صورت خودکار آدرس عمومی باکت `member-photos` را می‌سازد.

### ۳. جایگزینی کارت معمایی عضو پنجم (`sort_order = 5`)
در جدول `members` ردیف `sort_order = 5` (که فعلاً `به‌زودی...` است) را ویرایش کنید و نام واقعی، نقش (`role`)، مهارت‌ها (`skills`)، بیوگرافی (`bio`)، `photo_url` و `links` عضو پنجم را وارد کنید. به‌محض تغییر نام از `به‌زودی...`، کارت قفل‌شده به‌طور خودکار و بدون نیاز به تغییر کد به کارت عادی عضو تبدیل می‌شود.

---

## استقرار (Deployment)

پروژه کاملاً استاتیک است (`base: './'`) و روی هر سرویسی قابل استقرار است:

- **Vercel / Netlify**: مخزن را متصل کنید، دستور ساخت را `npm run build` و پوشه‌ی خروجی را `dist` بگذارید و دو متغیر `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` را در بخش Environment Variables وارد کنید.
- **GitHub Pages**: خروجی `npm run build` (پوشه‌ی `dist`) را با متغیرهای محیطی بالا منتشر کنید.
