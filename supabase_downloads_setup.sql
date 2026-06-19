-- English Peak downloads setup / migration
-- Run this in Supabase SQL Editor after deploying the updated site.

create table if not exists public.download_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_tier text not null default 'premium',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.download_categories
  add column if not exists access_tier text not null default 'premium',
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

alter table public.download_categories drop constraint if exists download_categories_access_tier_check;
alter table public.download_categories
  add constraint download_categories_access_tier_check check (access_tier in ('public', 'premium'));

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  drive_url text not null,
  file_type text default 'PDF',
  access_tier text not null default 'premium' check (access_tier in ('public', 'free', 'premium')),
  category_id uuid references public.download_categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.downloads
  add column if not exists category_id uuid references public.download_categories(id) on delete set null,
  add column if not exists sort_order integer not null default 0;

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

alter table public.download_categories enable row level security;
alter table public.downloads enable row level security;

drop policy if exists "download_categories_visible" on public.download_categories;
create policy "download_categories_visible"
on public.download_categories for select
using (
  is_active = true
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "download_categories_admin_all" on public.download_categories;
create policy "download_categories_admin_all"
on public.download_categories for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "downloads_select_by_tier" on public.downloads;
create policy "downloads_select_by_tier"
on public.downloads for select
using (
  is_active = true and (
    -- Files without a category are General Downloads: any signed-in account.
    (category_id is null and auth.uid() is not null)
    or exists (
      select 1 from public.download_categories c
      where c.id = downloads.category_id
        and c.is_active = true
        and (
          c.access_tier = 'public'
          or (
            c.access_tier = 'premium'
            and exists (
              select 1 from public.profiles p
              where p.id = auth.uid()
                and (p.is_admin = true or p.tier in ('premium', 'teacher', 'courtesy'))
            )
          )
        )
    )
  )
);

drop policy if exists "downloads_admin_all" on public.downloads;
create policy "downloads_admin_all"
on public.downloads for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
