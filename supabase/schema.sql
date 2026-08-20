-- WingBrief — progress sync schema.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It is safe to re-run: every statement is guarded.
--
-- Design note: progress is stored as a single JSONB document per user, mirroring
-- the ProgressState shape the learning engine already uses. That keeps the
-- client free of an ORM and means adding a field to the engine needs no
-- migration here. Row Level Security is what makes it safe — a student can only
-- ever read or write their own row.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.progress is
  'One row per student: the full WingBrief ProgressState document.';

alter table public.progress enable row level security;

-- Drop-and-recreate so re-running the file cannot fail on an existing policy.
drop policy if exists "Students read their own progress"   on public.progress;
drop policy if exists "Students insert their own progress" on public.progress;
drop policy if exists "Students update their own progress" on public.progress;
drop policy if exists "Students delete their own progress" on public.progress;

create policy "Students read their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Students insert their own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Students update their own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Students delete their own progress"
  on public.progress for delete
  using (auth.uid() = user_id);

-- Keep updated_at honest even if a client forgets to send it.
create or replace function public.touch_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progress_set_updated_at on public.progress;
create trigger progress_set_updated_at
  before update on public.progress
  for each row execute function public.touch_progress_updated_at();
