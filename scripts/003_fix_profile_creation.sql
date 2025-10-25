-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert into profiles table
  insert into public.profiles (id, email, display_name, user_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'user_type', 'instructor')
  );
  
  -- Insert into type-specific table based on user_type
  if (new.raw_user_meta_data->>'user_type' = 'studio') then
    insert into public.studio_profiles (id, studio_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'display_name', 'My Studio')
    );
  else
    insert into public.instructor_profiles (id)
    values (new.id);
  end if;
  
  return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
