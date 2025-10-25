-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1_id uuid not null references public.profiles(id) on delete cascade,
  participant_2_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(participant_1_id, participant_2_id)
);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations policies
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = participant_1_id or auth.uid() = participant_2_id);

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_1_id or auth.uid() = participant_2_id);

-- Messages policies
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.participant_1_id = auth.uid() or conversations.participant_2_id = auth.uid())
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.participant_1_id = auth.uid() or conversations.participant_2_id = auth.uid())
    )
  );

create policy "Users can update their own messages"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.participant_1_id = auth.uid() or conversations.participant_2_id = auth.uid())
    )
  );

-- Create indexes for better performance
create index if not exists conversations_participant_1_idx on public.conversations(participant_1_id);
create index if not exists conversations_participant_2_idx on public.conversations(participant_2_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

-- Function to update conversation updated_at timestamp
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

-- Trigger to update conversation timestamp when a message is sent
create trigger update_conversation_timestamp_trigger
  after insert on public.messages
  for each row
  execute function update_conversation_timestamp();
