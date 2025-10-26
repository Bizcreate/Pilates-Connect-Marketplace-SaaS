-- Create referral system for user growth

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.profiles(id) on delete cascade,
  referred_id uuid references public.profiles(id) on delete set null,
  referral_code text not null,
  referred_email text not null,
  status text default 'pending' check (status in ('pending', 'completed', 'expired')),
  reward_amount integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.referrals enable row level security;

-- RLS Policies
create policy "Users can view their own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

create policy "Users can create referrals"
  on public.referrals for insert
  with check (auth.uid() = referrer_id);

-- Create indexes
create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);
create index if not exists referrals_referred_id_idx on public.referrals(referred_id);
create index if not exists referrals_code_idx on public.referrals(referral_code);
