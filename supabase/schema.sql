-- Run this in your Supabase SQL editor after creating a new project

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'done', 'on_hold')),
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  tags text[] not null default '{}',
  notes text,
  due_date date,
  last_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: each user only sees their own projects
alter table projects enable row level security;

create policy "Users can manage their own projects"
  on projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Subtasks
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  done boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table subtasks enable row level security;

create policy "Users can manage subtasks of their projects"
  on subtasks for all
  using (
    exists (
      select 1 from projects
      where projects.id = subtasks.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on row change
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function handle_updated_at();
