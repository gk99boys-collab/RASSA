-- Optional per-member artwork. Leave the roster, legacy photos, bucket and seed alone.
create table public.rassa_member_media (
  member_id uuid primary key references public.members(id) on delete cascade,
  portrait_path text check (portrait_path ~ '^portrait/[a-f0-9]{32}[.](webp|png)$'),
  cover_path text check (cover_path ~ '^cover/[a-f0-9]{32}[.](webp|png)$'),
  check (portrait_path is not null or cover_path is not null)
);
alter table public.rassa_member_media enable row level security;
revoke all on public.rassa_member_media from public, anon, authenticated;
grant select on public.rassa_member_media to anon, authenticated;
create policy "Public member image references" on public.rassa_member_media for select to anon, authenticated using (true);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('rassa-member-media','rassa-member-media',true,5242880,array['image/webp','image/png']);
-- Storage, like PostgREST, supplies request.headers for the current request.
-- This boolean checks the caller's own expiring ticket; it discloses no credentials.
grant execute on function public.rassa_is_member_admin() to anon;
create policy "Desk inserts immutable member images" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'rassa-member-media' and name ~ '^(portrait|cover)/[a-f0-9]{32}[.](webp|png)$'
  and storage.allow_only_operation('object.upload') and (select public.rassa_is_member_admin()));
-- Known public URLs can be displayed; listing and cleanup are desk-only. No UPDATE/upsert grant.
create policy "Desk reads member image objects" on storage.objects for select to anon, authenticated
using (bucket_id = 'rassa-member-media' and (select public.rassa_is_member_admin()));
create policy "Desk removes detached member images" on storage.objects for delete to anon, authenticated
using (bucket_id = 'rassa-member-media' and storage.allow_only_operation('object.delete_many')
  and (select public.rassa_is_member_admin()) and not exists (
    select 1 from public.rassa_member_media m where storage.objects.name in (m.portrait_path,m.cover_path)));

-- One transaction publishes the member and both image references. An omitted
-- slot preserves its value; explicit null restores the legacy/default artwork.
create function public.rassa_save_member_card(p_id uuid, p_sort_order integer, p_name text, p_role text,
  p_skills text[], p_bio text, p_photo_url text, p_links jsonb, p_media jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare saved uuid; portrait text; cover text; slot text; path text;
begin
  if not public.rassa_is_member_admin() then raise insufficient_privilege; end if;
  if jsonb_typeof(p_media) is distinct from 'object' or p_media - array['portrait','cover'] <> '{}'::jsonb then
    raise exception 'Invalid media patch' using errcode = '22023';
  end if;
  for slot in select jsonb_object_keys(p_media) loop
    path := p_media ->> slot;
    if path is not null and (jsonb_typeof(p_media -> slot) <> 'string'
      or path !~ ('^' || slot || '/[a-f0-9]{32}[.](webp|png)$') or not exists (
        select 1 from storage.objects o where o.bucket_id = 'rassa-member-media' and o.name = path
          and o.metadata->>'mimetype' in ('image/webp','image/png'))) then
      raise exception 'Invalid member image' using errcode = '22023';
    end if;
  end loop;
  saved := public.rassa_save_member(p_id,p_sort_order,p_name,p_role,p_skills,p_bio,p_photo_url,p_links);
  if p_media <> '{}'::jsonb then
    select m.portrait_path, m.cover_path into portrait, cover from public.rassa_member_media m where m.member_id = saved;
    if p_media ? 'portrait' then portrait := p_media->>'portrait'; end if;
    if p_media ? 'cover' then cover := p_media->>'cover'; end if;
    if portrait is null and cover is null then
      delete from public.rassa_member_media where member_id = saved;
    else
      insert into public.rassa_member_media(member_id,portrait_path,cover_path) values(saved,portrait,cover)
        on conflict(member_id) do update set portrait_path = excluded.portrait_path, cover_path = excluded.cover_path;
    end if;
  end if;
  return saved;
end;
$$;
revoke all on function public.rassa_save_member_card(uuid,integer,text,text,text[],text,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.rassa_save_member_card(uuid,integer,text,text,text[],text,text,jsonb,jsonb) to anon, authenticated;
