-- English Peak downloads setup
-- Run this once in Supabase SQL Editor before using the Downloads admin tab.

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  drive_url text not null,
  file_type text default 'PDF',
  access_tier text not null default 'premium' check (access_tier in ('public', 'free', 'premium')),
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_downloads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_downloads_updated_at on public.downloads;
create trigger set_downloads_updated_at
before update on public.downloads
for each row execute function public.set_downloads_updated_at();

alter table public.downloads enable row level security;

drop policy if exists "downloads_select_by_tier" on public.downloads;
create policy "downloads_select_by_tier"
on public.downloads
for select
using (is_active = true);

drop policy if exists "downloads_admin_all" on public.downloads;
create policy "downloads_admin_all"
on public.downloads
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
