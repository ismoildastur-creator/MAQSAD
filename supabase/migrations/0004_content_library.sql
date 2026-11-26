-- MAQSAD secure content library and administrator access
create table if not exists public.maqsad_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.maqsad_admins enable row level security;
create or replace function public.is_maqsad_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.maqsad_admins where user_id = auth.uid()); $$;
revoke all on function public.is_maqsad_admin() from public;
grant execute on function public.is_maqsad_admin() to anon, authenticated;

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null default '',
  description text not null default '',
  category text not null default 'Umumiy',
  item_type text not null check (item_type in ('book','video','lesson')),
  storage_path text,
  source_url text,
  cover_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint library_item_has_source check (storage_path is not null or source_url is not null)
);
create index if not exists library_items_published_order_idx
 on public.library_items(is_published,sort_order,created_at desc);
alter table public.library_items enable row level security;
drop policy if exists "Published library items are readable" on public.library_items;
create policy "Published library items are readable" on public.library_items for select to anon,authenticated
 using (is_published=true or public.is_maqsad_admin());
drop policy if exists "Admins insert library items" on public.library_items;
create policy "Admins insert library items" on public.library_items for insert to authenticated
 with check (public.is_maqsad_admin() and created_by=auth.uid());
drop policy if exists "Admins update library items" on public.library_items;
create policy "Admins update library items" on public.library_items for update to authenticated
 using (public.is_maqsad_admin()) with check (public.is_maqsad_admin());
drop policy if exists "Admins delete library items" on public.library_items;
create policy "Admins delete library items" on public.library_items for delete to authenticated
 using (public.is_maqsad_admin());
grant select on public.library_items to anon,authenticated;
grant insert,update,delete on public.library_items to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('maqsad-library','maqsad-library',false,52428800,
 array['application/pdf','image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict(id) do update set public=false,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public can read MAQSAD library files" on storage.objects;
drop policy if exists "Published MAQSAD library files are readable" on storage.objects;
create policy "Published MAQSAD library files are readable" on storage.objects for select to anon,authenticated
 using(bucket_id='maqsad-library' and (public.is_maqsad_admin() or exists(
  select 1 from public.library_items li where li.storage_path=name and li.is_published=true
 )));
drop policy if exists "Admins upload MAQSAD library files" on storage.objects;
create policy "Admins upload MAQSAD library files" on storage.objects for insert to authenticated
 with check(bucket_id='maqsad-library' and public.is_maqsad_admin());
drop policy if exists "Admins update MAQSAD library files" on storage.objects;
create policy "Admins update MAQSAD library files" on storage.objects for update to authenticated
 using(bucket_id='maqsad-library' and public.is_maqsad_admin())
 with check(bucket_id='maqsad-library' and public.is_maqsad_admin());
drop policy if exists "Admins delete MAQSAD library files" on storage.objects;
create policy "Admins delete MAQSAD library files" on storage.objects for delete to authenticated
 using(bucket_id='maqsad-library' and public.is_maqsad_admin());
