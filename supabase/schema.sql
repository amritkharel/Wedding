create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  guest_name text not null,
  invited_count integer not null default 1 check (invited_count >= 1),
  group_name text not null default 'Guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  invitation_id uuid primary key references public.invitations(id) on delete cascade,
  attending boolean not null,
  guest_count integer not null default 0 check (guest_count >= 0),
  message text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_token_idx on public.invitations(token);
create index if not exists rsvps_submitted_at_idx on public.rsvps(submitted_at desc);

alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;

-- No public RLS policies are created on purpose.
-- The static website talks to the Edge Function, and the Edge Function uses
-- the service-role key on the server side. Guests never receive direct table
-- access.
