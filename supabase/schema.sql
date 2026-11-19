create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  total_points integer not null default 0 check (total_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.point_events (
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null,
  game_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.profiles enable row level security;
alter table public.point_events enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can read their own point events" on public.point_events;
create policy "Users can read their own point events"
  on public.point_events for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.award_point(p_event_id uuid, p_game_id text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  updated_points integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_game_id not in (
    'songs', 'stories', 'riddles', 'tongue-twisters', 'memory',
    'shapes-colors', 'math-addition', 'number-series',
    'scrambled-words', 'science', 'world-history', 'english', 'spanish', 'puzzles'
  ) then
    raise exception 'Unknown game';
  end if;

  insert into public.profiles (id)
  values (current_user_id)
  on conflict (id) do nothing;

  insert into public.point_events (user_id, event_id, game_id)
  values (current_user_id, p_event_id, p_game_id)
  on conflict (user_id, event_id) do nothing;

  if found then
    insert into public.profiles as profile (id, total_points)
    values (current_user_id, 1)
    on conflict (id) do update
      set total_points = profile.total_points + 1,
          updated_at = now()
    returning total_points into updated_points;
  else
    select total_points
      into updated_points
      from public.profiles
      where id = current_user_id;
  end if;

  return updated_points;
end;
$$;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
revoke all on public.point_events from anon, authenticated;
grant select on public.point_events to authenticated;
revoke all on function public.award_point(uuid, text) from public, anon;
grant execute on function public.award_point(uuid, text) to authenticated;
