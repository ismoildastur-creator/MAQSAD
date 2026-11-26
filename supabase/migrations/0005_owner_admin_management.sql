-- MAQSAD: owner-controlled administrator hierarchy
-- Run once after 0004_content_library.sql.
create table if not exists public.maqsad_owner (
  user_id uuid primary key references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.maqsad_owner enable row level security;
revoke all on public.maqsad_owner from anon, authenticated;

alter table public.maqsad_admins
  add column if not exists role text not null default 'admin'
  check (role in ('admin'));

create or replace function public.is_maqsad_owner()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.maqsad_owner where user_id = auth.uid());
$$;
revoke all on function public.is_maqsad_owner() from public;
grant execute on function public.is_maqsad_owner() to authenticated;

create or replace function public.is_maqsad_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_maqsad_owner()
    or exists(select 1 from public.maqsad_admins where user_id = auth.uid());
$$;
revoke all on function public.is_maqsad_admin() from public;
grant execute on function public.is_maqsad_admin() to anon, authenticated;

create or replace function public.maqsad_list_admins()
returns table(user_id uuid, email text, created_at timestamptz)
language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_maqsad_owner() then
    raise exception 'Faqat asosiy admin adminlar ro‘yxatini boshqaradi';
  end if;
  return query
    select a.user_id, u.email::text, a.created_at
    from public.maqsad_admins a
    join auth.users u on u.id = a.user_id
    order by a.created_at;
end;
$$;
revoke all on function public.maqsad_list_admins() from public;
grant execute on function public.maqsad_list_admins() to authenticated;

create or replace function public.maqsad_grant_admin(target_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_maqsad_owner() then
    raise exception 'Admin huquqini faqat asosiy admin bera oladi';
  end if;
  if target_user_id is null or exists(select 1 from public.maqsad_owner where user_id=target_user_id) then
    raise exception 'Noto‘g‘ri foydalanuvchi';
  end if;
  if not exists(select 1 from auth.users where id=target_user_id) then
    raise exception 'Bunday foydalanuvchi topilmadi';
  end if;
  insert into public.maqsad_admins(user_id) values(target_user_id)
  on conflict(user_id) do nothing;
end;
$$;
revoke all on function public.maqsad_grant_admin(uuid) from public;
grant execute on function public.maqsad_grant_admin(uuid) to authenticated;

create or replace function public.maqsad_revoke_admin(target_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_maqsad_owner() then
    raise exception 'Admin huquqini faqat asosiy admin bekor qila oladi';
  end if;
  delete from public.maqsad_admins where user_id=target_user_id;
end;
$$;
revoke all on function public.maqsad_revoke_admin(uuid) from public;
grant execute on function public.maqsad_revoke_admin(uuid) to authenticated;
