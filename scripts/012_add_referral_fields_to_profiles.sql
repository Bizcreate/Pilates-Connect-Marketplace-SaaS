-- Add missing referral fields to profiles table

-- Add referral_code column (unique for each user to share with others)
alter table public.profiles 
add column if not exists referral_code text unique;

-- Add referral_earnings column (tracks total earnings from referrals)
alter table public.profiles 
add column if not exists referral_earnings integer default 0;

-- Add referred_by column (who referred this user)
alter table public.profiles 
add column if not exists referred_by uuid references public.profiles(id);

-- Create index for faster referral code lookups
create index if not exists profiles_referral_code_idx on public.profiles(referral_code);

-- Generate referral codes for existing users who don't have one
update public.profiles 
set referral_code = substring(md5(random()::text || id::text) from 1 for 8)
where referral_code is null;

-- Make sure all new profiles get a referral code via trigger
create or replace function generate_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := substring(md5(random()::text || new.id::text) from 1 for 8);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_referral_code on public.profiles;
create trigger set_referral_code
  before insert on public.profiles
  for each row
  execute function generate_referral_code();
