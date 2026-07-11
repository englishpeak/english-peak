-- English Peak pricing setup / migration
-- Run this in Supabase SQL Editor before using Admin -> Pricing.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_site_settings_updated_at();

insert into public.site_settings (key, value)
values ('pricing', '{"mode":"half_off","expires_at":null}'::jsonb)
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public_pricing" on public.site_settings;
create policy "site_settings_select_public_pricing"
on public.site_settings for select
using (key = 'pricing');

drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all"
on public.site_settings for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
