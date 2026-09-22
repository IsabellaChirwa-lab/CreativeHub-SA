-- Creative Hub ZA — Supabase schema
-- Run this in Supabase Dashboard > SQL Editor

-- Profiles: one row per signed-up user, extends Supabase's built-in auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('artist','label','radio','brand','admin')) default 'artist',
  email text,
  created_at timestamptz default now()
);

-- Briefs: gigs/jobs posted by labels, radio stations, or brands
create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  budget text,
  deadline text,
  description text,
  posted_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Applications: creatives applying to a brief
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid references briefs(id) on delete cascade,
  applicant uuid references profiles(id),
  created_at timestamptz default now()
);

-- Bookings: direct booking requests + escrow deposit tracking
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  target_name text,
  deposit_amount numeric,
  payment_status text check (payment_status in ('pending','escrow_held','released','refunded')) default 'pending',
  yoco_charge_id text,
  created_at timestamptz default now()
);

-- Row Level Security: users can only read/write their own profile
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Briefs are publicly readable, only the poster can edit their own
alter table briefs enable row level security;
create policy "Anyone can view briefs" on briefs for select using (true);
create policy "Signed-in users can post briefs" on briefs for insert with check (auth.uid() = posted_by);

-- Applications: applicant can insert their own, poster of the brief can view them
alter table applications enable row level security;
create policy "Users can view their own applications" on applications for select using (auth.uid() = applicant);
create policy "Users can apply" on applications for insert with check (auth.uid() = applicant);
