-- Only digests live here. Provision the one gate outside Git; no row = no access.
create table rassa_private.pin_gate (
  singleton boolean primary key default true check (singleton),
  link_hash bytea not null check (octet_length(link_hash) = 32),
  pin_verifier text not null,
  failures integer not null default 0 check (failures between 0 and 4),
  retry_at timestamptz,
  session_hash bytea,
  session_until timestamptz
);
alter table rassa_private.pin_gate enable row level security;
revoke all on rassa_private.pin_gate from public, anon, authenticated;

create function public.rassa_open_desk(p_link text, p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  g rassa_private.pin_gate%rowtype;
  ticket text;
  expiry timestamptz;
begin
  if p_link is null or p_pin is null or p_link !~ '^[a-f0-9]{64}$' or p_pin !~ '^[0-9]{4}$' then
    return '{"state":"denied"}'::jsonb;
  end if;
  -- An unknown address cannot consume the owner's attempts. Serialize real
  -- attempts across devices/workers. Return, don't raise: failures must commit.
  select * into g from rassa_private.pin_gate
    where link_hash = sha256(convert_to(p_link, 'UTF8')) for update;
  if not found then return '{"state":"denied"}'::jsonb; end if;
  if g.retry_at > clock_timestamp() then
    return jsonb_build_object('state', 'wait', 'seconds', greatest(1, ceil(extract(epoch from g.retry_at - clock_timestamp()))));
  end if;
  if extensions.crypt(p_link || ':' || p_pin, g.pin_verifier) is distinct from g.pin_verifier then
    if g.failures = 4 then
      update rassa_private.pin_gate set failures = 0, retry_at = clock_timestamp() + interval '30 minutes' where singleton;
      return '{"state":"wait","seconds":1800}'::jsonb;
    end if;
    update rassa_private.pin_gate set failures = failures + 1, retry_at = null where singleton;
    return '{"state":"denied"}'::jsonb;
  end if;
  ticket := encode(extensions.gen_random_bytes(32), 'hex');
  expiry := clock_timestamp() + interval '30 minutes';
  update rassa_private.pin_gate set failures = 0, retry_at = null,
    session_hash = sha256(convert_to(ticket, 'UTF8')), session_until = expiry where singleton;
  return jsonb_build_object('state', 'ok', 'ticket', ticket, 'expires_in', 1800);
end;
$$;

-- PostgREST supplies the headers of THIS request. No cookies, user metadata,
-- UID, client-side "is admin" switch, or table-write grants.
create function rassa_private.request_ticket_hash() returns bytea
language sql stable set search_path = '' as $$
  select sha256(convert_to(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-rassa-desk-session', 'UTF8'));
$$;
revoke all on function rassa_private.request_ticket_hash() from public, anon, authenticated;
create or replace function public.rassa_is_member_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from rassa_private.pin_gate where session_hash = rassa_private.request_ticket_hash()
    and session_until > statement_timestamp());
$$;
create function public.rassa_close_desk() returns void
language sql security definer set search_path = '' as $$
  update rassa_private.pin_gate set session_hash = null, session_until = null
    where session_hash = rassa_private.request_ticket_hash();
$$;
revoke all on function public.rassa_open_desk(text,text), public.rassa_close_desk() from public, anon, authenticated;
grant execute on function public.rassa_open_desk(text,text), public.rassa_close_desk(),
  public.rassa_save_member(uuid,integer,text,text,text[],text,text,jsonb), public.rassa_delete_member(uuid) to anon, authenticated;
