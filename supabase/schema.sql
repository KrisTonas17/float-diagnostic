-- Run this in your Supabase SQL editor to create the submissions table

create table if not exists diagnostic_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  company text not null,
  role text not null,
  inputs jsonb not null,
  results jsonb not null,
  submitted_at timestamptz not null default now(),
  walkthrough_requested boolean default false
);

-- Index for email lookups
create index on diagnostic_submissions (email);
create index on diagnostic_submissions (submitted_at desc);

-- Enable RLS
alter table diagnostic_submissions enable row level security;

-- Only service role can read/write (API routes use service role key)
create policy "Service role only" on diagnostic_submissions
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
