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
alter table public.entries add column if not exists user_id uuid;
alter table public.entries add column if not exists title text;
alter table public.entries add column if not exists transcript text;
alter table public.entries add column if not exists audio_path text;
alter table public.entries add column if not exists duration_seconds integer;
alter table public.entries add column if not exists created_at timestamptz;

-- Ensure defaults / backfills for existing rows (safe for old tables)
-- Note: if your existing `entries.id` is an IDENTITY column (bigint/int),
-- we must NOT change its default or backfill UUIDs.
do $$
declare
  id_is_identity boolean;
  id_is_uuid boolean;
begin
  select (a.attidentity <> '')
    into id_is_identity
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'entries'
    and a.attname = 'id'
    and a.attnum > 0
    and not a.attisdropped;

  select (t.typname = 'uuid')
    into id_is_uuid
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_type t on t.oid = a.atttypid
  where n.nspname = 'public'
    and c.relname = 'entries'
    and a.attname = 'id'
    and a.attnum > 0
    and not a.attisdropped;

  if coalesce(id_is_identity, false) = false and coalesce(id_is_uuid, false) = true then
    alter table public.entries alter column id set default gen_random_uuid();
    update public.entries set id = gen_random_uuid() where id is null;
  end if;
end $$;

alter table public.entries alter column created_at set default now();
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
-- Note: storage policies apply to storage.objects and may require elevated permissions.
-- If you see: "must be owner of table objects", create these in the Supabase Dashboard
-- (Storage -> Policies) or run this block as the database owner.
-- We store audio at: <user_id>/<uuid>.webm
do $$
begin
  begin
    execute 'alter table storage.objects enable row level security';

    execute 'drop policy if exists "audio_read_own" on storage.objects';
    execute $pol$
      create policy "audio_read_own"
        on storage.objects for select
        using (
          bucket_id = 'audio'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $pol$;

    execute 'drop policy if exists "audio_insert_own" on storage.objects';
    execute $pol$
      create policy "audio_insert_own"
        on storage.objects for insert
        with check (
          bucket_id = 'audio'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $pol$;

    execute 'drop policy if exists "audio_update_own" on storage.objects';
    execute $pol$
      create policy "audio_update_own"
        on storage.objects for update
        using (
          bucket_id = 'audio'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
        with check (
          bucket_id = 'audio'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $pol$;

    execute 'drop policy if exists "audio_delete_own" on storage.objects';
    execute $pol$
      create policy "audio_delete_own"
        on storage.objects for delete
        using (
          bucket_id = 'audio'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $pol$;
  exception
    when insufficient_privilege then
      raise notice 'Skipped storage.objects RLS policies: insufficient privileges. Create Storage policies in Supabase Dashboard (Storage -> Policies).';
  end;
end $$;

