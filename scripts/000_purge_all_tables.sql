-- Purge all existing tables and start fresh
-- This script drops all tables in the correct order to avoid foreign key conflicts

-- Drop tables in reverse dependency order
drop table if exists public.referrals cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.applications cascade;
drop table if exists public.availability_slots cascade;
drop table if exists public.cover_requests cascade;
drop table if exists public.jobs cascade;
drop table if exists public.instructor_profiles cascade;
drop table if exists public.studio_profiles cascade;
drop table if exists public.profiles cascade;

-- Drop storage buckets if they exist
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can update own files" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;

delete from storage.buckets where id in ('avatars', 'documents', 'instructor-media');

-- Drop any existing triggers
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
