-- Create messaging system for communication between users

-- Conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1_id uuid references public.profiles(id) on delete cascade,
  participant_2_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(participant_1_id, participant_2_id)
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- RLS Policies for conversations
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = participant_1_id or auth.uid() = participant_2_id);

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_1_id or auth.uid() = participant_2_id);

-- RLS Policies for messages
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    auth.uid() in (
      select participant_1_id from public.conversations where id = conversation_id
      union
      select participant_2_id from public.conversations where id = conversation_id
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    auth.uid() in (
      select participant_1_id from public.conversations where id = conversation_id
      union
      select participant_2_id from public.conversations where id = conversation_id
    )
  );

create policy "Users can update messages they received"
  on public.messages for update
  using (
    auth.uid() in (
      select participant_1_id from public.conversations where id = conversation_id
      union
      select participant_2_id from public.conversations where id = conversation_id
    )
  );

-- Create indexes
create index if not exists conversations_participant_1_idx on public.conversations(participant_1_id);
create index if not exists conversations_participant_2_idx on public.conversations(participant_2_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
