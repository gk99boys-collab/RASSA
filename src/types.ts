export interface NormalizedLink {
  label: string
  url: string
  type: string
}

export type RawLinks =
  | Array<{ label?: string; title?: string; name?: string; url?: string; href?: string; type?: string; icon?: string }>
  | Record<string, unknown>
  | null
  | undefined

export interface Team {
  id: string
  name: string
  tagline: string
  description: string
  achievement_text: string
  links: RawLinks
}

export interface Member {
  id: string
  sort_order: number
  name: string
  role: string
  skills: string[]
  bio: string
  photo_url: string | null
  media?: { portrait_path: string | null; cover_path: string | null } | null
  links: RawLinks
  /** Optional local profile facts (education / experience). Supabase rows simply omit them. */
  education?: string
  experience?: string
}

export type DataSource = 'loading' | 'supabase' | 'fallback'
