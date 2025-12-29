-- Voice Journal (audio to text / voice notes) schema for Supabase
-- Run in Supabase SQL editor.

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Entries table (create if missing)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text,
  transcript text,
  audio_path text,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

-- If the table already existed, ensure required columns exist
alter table public.entries add column if not exists id uuid;
alter table public.entries add column if not exists user_id uuid;
alter table public.entries add column if not exists title text;
alter table public.entries add column if not exists transcript text;
alter table public.entries add column if not exists audio_path text;
alter table public.entries add column if not exists duration_seconds integer;
alter table public.entries add column if not exists created_at timestamptz;

-- Ensure defaults / backfills for existing rows (safe for old tables)
alter table public.entries alter column id set default gen_random_uuid();
alter table public.entries alter column created_at set default now();
update public.entries set id = gen_random_uuid() where id is null;
update public.entries set created_at = now() where created_at is null;

-- Ensure primary key exists (if the table pre-existed without it)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_pkey'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries add constraint entries_pkey primary key (id);
  end if;
end $$;

-- Ensure foreign key exists (if the table pre-existed without it)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_user_id_fkey'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end $$;

create index if not exists entries_user_id_created_at_idx
  on public.entries (user_id, created_at desc);

alter table public.entries enable row level security;

-- RLS: users can CRUD their own entries
drop policy if exists "entries_select_own" on public.entries;
create policy "entries_select_own"
  on public.entries for select
  using (user_id is not null and auth.uid() = user_id);

drop policy if exists "entries_insert_own" on public.entries;
create policy "entries_insert_own"
  on public.entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "entries_update_own" on public.entries;
create policy "entries_update_own"
  on public.entries for update
  using (user_id is not null and auth.uid() = user_id)
  with check (user_id is not null and auth.uid() = user_id);

drop policy if exists "entries_delete_own" on public.entries;
create policy "entries_delete_own"
  on public.entries for delete
  using (user_id is not null and auth.uid() = user_id);

-- Storage bucket for audio recordings
-- Create via UI or SQL (if supported in your project):
--   insert into storage.buckets (id, name, public) values ('audio', 'audio', false);

-- Storage RLS: allow authenticated users to manage their own audio files
-- Note: storage policies apply to storage.objects.
-- We store audio at: <user_id>/<uuid>.webm
alter table storage.objects enable row level security;

drop policy if exists "audio_read_own" on storage.objects;
create policy "audio_read_own"
  on storage.objects for select
  using (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "audio_insert_own" on storage.objects;
create policy "audio_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "audio_update_own" on storage.objects;
create policy "audio_update_own"
  on storage.objects for update
  using (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "audio_delete_own" on storage.objects;
create policy "audio_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

