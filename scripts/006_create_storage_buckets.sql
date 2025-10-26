-- Create storage buckets for file uploads

-- Insert storage buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('instructor-media', 'instructor-media', true)
on conflict (id) do nothing;

-- Storage policies for avatars (public)
create policy "Public Access"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated'
  );

create policy "Users can update own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for documents (private)
create policy "Users can view own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own documents"
  on storage.objects for update
  using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for instructor media (public)
create policy "Public can view instructor media"
  on storage.objects for select
  using (bucket_id = 'instructor-media');

create policy "Instructors can upload media"
  on storage.objects for insert
  with check (
    bucket_id = 'instructor-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Instructors can update own media"
  on storage.objects for update
  using (
    bucket_id = 'instructor-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Instructors can delete own media"
  on storage.objects for delete
  using (
    bucket_id = 'instructor-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
