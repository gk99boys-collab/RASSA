-- ============================================================================
-- Rasa Team Site (رَسا) — Supabase Schema, RLS, Storage & Initial Seed
-- 8th National Basij Digital Content Production Event
-- ============================================================================

-- 1. Create `team` table
CREATE TABLE IF NOT EXISTS public.team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  achievement_text text NOT NULL DEFAULT '',
  links jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- 2. Create `members` table
CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order integer NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}'::text[],
  bio text NOT NULL DEFAULT '',
  photo_url text,
  links jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS members_sort_order_idx ON public.members (sort_order ASC);

-- 3. Row Level Security: strictly public read-only (SELECT only)
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read-only access on team" ON public.team;
CREATE POLICY "Public read-only access on team"
  ON public.team
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read-only access on members" ON public.members;
CREATE POLICY "Public read-only access on members"
  ON public.members
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE ALL ON public.team FROM anon, authenticated;
REVOKE ALL ON public.members FROM anon, authenticated;
GRANT SELECT ON public.team TO anon, authenticated;
GRANT SELECT ON public.members TO anon, authenticated;

-- 4. Public Storage bucket `member-photos` (public read-only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-photos',
  'member-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read access for member-photos" ON storage.objects;
CREATE POLICY "Public read access for member-photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'member-photos');

-- 5. Seed `team`
INSERT INTO public.team (name, tagline, description, achievement_text, links)
SELECT
  'رَسا',
  'رَسا؛ می‌رسیم، می‌سازیم، می‌درخشیم',
  'تیم رَسا با بهره‌گیری از بهترین و به‌روزترین ابزارهای طراحی اپلیکیشن و سایت پا به این میدان گذاشته تا مثل دوره‌ی هفتم دوباره بدرخشد و مقام نخست را از آنِ خود کند.',
  'رتبه‌ی اول مرحله‌ی شهرستانی (خوسف) در دوره‌ی هفتم',
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.team);

-- 6. Seed `members`
INSERT INTO public.members (sort_order, name, role, skills, bio, photo_url, links)
VALUES
  (
    1,
    'مجتبی میدانی',
    'سرپرست تیم و مدیر پروژه',
    ARRAY['مدیریت پروژه', 'طراحی گرافیک', 'طراحی سایت', 'تولید محتوا و انیمیشن'],
    'ناخدای رَسا؛ دانش‌آموخته‌ی تولید محتوا و انیمیشن از هنرستان کاردانش امام حسین با ۳ سال سابقه‌ی طراحی گرافیک و سایت. هماهنگی تیم، زمان‌بندی و تصمیم‌های نهایی با اوست.',
    NULL,
    '[]'::jsonb
  ),
  (
    2,
    'محمد صحرانورد',
    'توسعه‌دهنده موبایل',
    ARRAY['توسعه موبایل', 'طراحی گرافیک', 'طراحی سایت', 'انیمیشن'],
    'کسی که ایده‌ها را روی صفحه‌ی گوشی زنده می‌کند. دانش‌آموخته‌ی تولید محتوا و انیمیشن از هنرستان کاردانش امام حسین با ۳ سال سابقه‌ی طراحی گرافیک و سایت.',
    NULL,
    '[]'::jsonb
  ),
  (
    3,
    'سید ابوالفضل میرزازاده',
    'توسعه‌دهنده بک‌اند و دیتابیس',
    ARRAY['بک‌اند', 'پایگاه داده', 'طراحی سایت', 'طراحی گرافیک'],
    'مغز پنهان اپلیکیشن؛ سرور و داده‌ها زیر دست اوست. دانش‌آموخته‌ی تولید محتوا و انیمیشن از هنرستان کاردانش امام حسین با ۳ سال سابقه‌ی طراحی گرافیک و سایت.',
    NULL,
    '[]'::jsonb
  ),
  (
    4,
    'علیرضا حاجی‌زاده',
    'مسئول محتوا و ارائه',
    ARRAY['تولید محتوا', 'ارائه', 'حسابداری شرکتی'],
    'صدای تیم در برابر داوران؛ با دقت یک حسابدار، متن‌ها و ارائه‌ها را منظم و قانع‌کننده می‌چیند. دانش‌آموخته‌ی حسابداری از هنرستان کاردانش امام حسین با ۳ سال سابقه‌ی حسابداری شرکتی.',
    NULL,
    '[]'::jsonb
  ),
  (
    5,
    'به‌زودی...',
    'عضو پنجم',
    ARRAY[]::text[],
    'عضو پنجم رَسا به‌زودی معرفی می‌شود.',
    NULL,
    '[]'::jsonb
  )
ON CONFLICT (sort_order) DO NOTHING;
