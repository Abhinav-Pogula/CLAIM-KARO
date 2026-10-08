-- ============================================================
-- ClaimKaro — Supabase schema
-- Run this in the Supabase SQL Editor (dashboard → SQL editor)
-- ============================================================

-- ----------------------------------------------------------------
-- STORAGE (manual step)
-- ----------------------------------------------------------------
-- NOTE: Create a PRIVATE storage bucket named "evidence" in the
-- Supabase dashboard: Storage → New Bucket → name "evidence" → Private.
-- ----------------------------------------------------------------


-- ----------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------
-- cases
-- ----------------------------------------------------------------
create table if not exists cases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  status      text not null default 'uploaded'
              check (status in ('uploaded','extracted','approved','drafted','sent')),
  case_file   jsonb,
  verify      jsonb,
  score       int,
  route       text,
  draft       jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ----------------------------------------------------------------
-- evidence
-- ----------------------------------------------------------------
create table if not exists evidence (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cases on delete cascade,
  kind          text not null
                check (kind in ('photo','voice','invoice','video')),
  storage_path  text not null,
  mime_type     text,
  created_at    timestamptz default now()
);

-- ----------------------------------------------------------------
-- case_events
-- ----------------------------------------------------------------
create table if not exists case_events (
  id         uuid primary key default gen_random_uuid(),
  case_id    uuid not null references cases on delete cascade,
  step       text not null,
  status     text not null,
  output     jsonb,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------
-- policies
-- ----------------------------------------------------------------
create table if not exists policies (
  brand           text primary key,
  return_days     int,
  warranty_months int,
  support_email   text,
  complaint_url   text,
  clause          text,
  source_url      text,
  created_at      timestamptz default now()
);


-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table profiles    enable row level security;
alter table cases       enable row level security;
alter table evidence    enable row level security;
alter table case_events enable row level security;
alter table policies    enable row level security;


-- ---- profiles --------------------------------------------------
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);


-- ---- cases -----------------------------------------------------
create policy "Users can view own cases"
  on cases for select
  using (auth.uid() = user_id);

create policy "Users can insert own cases"
  on cases for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cases"
  on cases for update
  using (auth.uid() = user_id);


-- ---- evidence --------------------------------------------------
create policy "Users can view own evidence"
  on evidence for select
  using (
    exists (
      select 1 from cases
      where cases.id = evidence.case_id
        and cases.user_id = auth.uid()
    )
  );

create policy "Users can insert own evidence"
  on evidence for insert
  with check (
    exists (
      select 1 from cases
      where cases.id = evidence.case_id
        and cases.user_id = auth.uid()
    )
  );


-- ---- case_events -----------------------------------------------
create policy "Users can view own case events"
  on case_events for select
  using (
    exists (
      select 1 from cases
      where cases.id = case_events.case_id
        and cases.user_id = auth.uid()
    )
  );

create policy "Users can insert own case events"
  on case_events for insert
  with check (
    exists (
      select 1 from cases
      where cases.id = case_events.case_id
        and cases.user_id = auth.uid()
    )
  );


-- ---- policies (public read for authenticated users) ------------
create policy "Authenticated users can read policies"
  on policies for select
  to authenticated
  using (true);


-- ---- demo merchant inbox (complaint emails are delivered here in demo mode) ----
alter table profiles add column if not exists demo_email text;
