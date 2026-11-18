-- A separate, closed-by-default member desk. Do not run the reference seed.
-- No direct INSERT/UPDATE/DELETE grants or changes to the public SELECT policies.
create schema rassa_private;
revoke all on schema rassa_private from public, anon, authenticated;
create table rassa_private.member_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table rassa_private.member_admins enable row level security;
revoke all on table rassa_private.member_admins from public, anon, authenticated;

create function public.rassa_is_member_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from rassa_private.member_admins where user_id = (select auth.uid()));
$$;

create function public.rassa_save_member(
  p_id uuid, p_sort_order integer, p_name text, p_role text, p_skills text[],
  p_bio text, p_photo_url text, p_links jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare saved uuid;
begin
  if not public.rassa_is_member_admin() then raise insufficient_privilege; end if;
  if p_sort_order is null or p_sort_order < 1 or nullif(btrim(p_name), '') is null
    or nullif(btrim(p_role), '') is null or jsonb_typeof(p_links) not in ('object', 'array') then
    raise exception 'Invalid member fields' using errcode = '22023';
  end if;
  if p_id is null then
    insert into public.members (sort_order, name, role, skills, bio, photo_url, links)
    values (p_sort_order, btrim(p_name), btrim(p_role), coalesce(p_skills, '{}'),
      coalesce(p_bio, ''), nullif(btrim(p_photo_url), ''), coalesce(p_links, '[]')) returning id into saved;
  else
    update public.members set sort_order = p_sort_order, name = btrim(p_name), role = btrim(p_role),
      skills = coalesce(p_skills, '{}'), bio = coalesce(p_bio, ''), photo_url = nullif(btrim(p_photo_url), ''),
      links = coalesce(p_links, '[]') where id = p_id returning id into strict saved;
  end if;
  return saved;
end;
$$;

create function public.rassa_delete_member(p_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare removed uuid;
begin
  if not public.rassa_is_member_admin() then raise insufficient_privilege; end if;
  delete from public.members where id = p_id returning id into strict removed;
  return removed;
end;
$$;

revoke all on function public.rassa_is_member_admin(),
  public.rassa_save_member(uuid, integer, text, text, text[], text, text, jsonb),
  public.rassa_delete_member(uuid) from public, anon, authenticated;
grant execute on function public.rassa_is_member_admin(),
  public.rassa_save_member(uuid, integer, text, text, text[], text, text, jsonb),
  public.rassa_delete_member(uuid) to authenticated;
