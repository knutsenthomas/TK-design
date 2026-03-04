-- Create a table for profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Contact form submissions
create extension if not exists "pgcrypto";

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  subject text,
  message text not null,
  consent boolean not null default false,
  source_page text,
  status text not null default 'new',
  ip_address text,
  user_agent text
);

alter table contact_messages enable row level security;

create policy "Anyone can submit contact messages." on contact_messages
  for insert to anon, authenticated
  with check (true);
