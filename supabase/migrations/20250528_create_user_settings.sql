-- Create user_settings table
create table if not exists public.user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email_notifications boolean default false,
  push_notifications boolean default false,
  notification_frequency text default 'immediate' check (notification_frequency in ('immediate', 'hourly', 'daily', 'weekly')),
  theme text default 'light' check (theme in ('light', 'dark', 'system')),
  font_size text default 'medium' check (font_size in ('small', 'medium', 'large')),
  default_date_range text default 'month' check (default_date_range in ('week', 'month', 'quarter', 'year')),
  auto_export boolean default false,
  export_format text default 'pdf' check (export_format in ('pdf', 'excel', 'csv')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Create RLS policies
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.user_settings
  for each row
  execute procedure public.handle_updated_at();
