-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Tasks table
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  date_key    text not null,        -- format: YYYY-MM-DD
  text        text not null,
  tag         text,                 -- 'work' | 'personal' | 'urgent' | 'health' | null
  color       text default 'purple',-- 'purple' | 'blue' | 'teal' | 'coral' | 'amber' | 'pink' | 'green'
  done        boolean not null default false,
  created_at  timestamptz default now()
);

-- Index for fast date lookups
create index if not exists tasks_date_key_idx on public.tasks(date_key);

-- Enable Row Level Security
alter table public.tasks enable row level security;

-- Allow all operations for now (single-user app, no auth)
-- When you add auth later, change these to: using (auth.uid() = user_id)
create policy "Allow all" on public.tasks for all using (true) with check (true);

-- Enable real-time replication
alter publication supabase_realtime add table public.tasks;
