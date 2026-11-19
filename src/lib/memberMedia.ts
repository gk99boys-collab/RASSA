import { publicDb } from './connection'

export const MEDIA_BUCKET = 'rassa-member-media'
// FK + primary key: PostgREST embeds zero or one media record, not a list.
export const MEMBER_COLUMNS = 'id,sort_order,name,role,skills,bio,photo_url,links,media:rassa_member_media(portrait_path,cover_path)'
export type ImageSlot = 'portrait' | 'cover'

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path || !/^(portrait|cover)\/[a-f0-9]{32}\.(webp|png)$/.test(path)) return null
  return publicDb?.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl ?? null
}
