create table if not exists public.user_game_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id text not null,
  volume integer not null check (volume > 0),
  highest_completed_level integer not null default 0
    check (highest_completed_level >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id, volume)
);

do $$
begin
  if exists (
    select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_game_progress'
        and column_name = 'language'
  ) then
    update public.user_game_progress as progress
      set highest_completed_level = merged.highest_completed_level,
          updated_at = merged.updated_at
      from (
        select user_id, game_id, volume,
               max(highest_completed_level) as highest_completed_level,
               max(updated_at) as updated_at
          from public.user_game_progress
          group by user_id, game_id, volume
      ) as merged
      where progress.user_id = merged.user_id
        and progress.game_id = merged.game_id
        and progress.volume = merged.volume;

    delete from public.user_game_progress as progress
      using public.user_game_progress as duplicate
      where progress.user_id = duplicate.user_id
        and progress.game_id = duplicate.game_id
        and progress.volume = duplicate.volume
        and progress.ctid > duplicate.ctid;

    alter table public.user_game_progress
      drop constraint if exists user_game_progress_pkey;
    alter table public.user_game_progress
      drop column language;
  end if;

  alter table public.user_game_progress
    drop constraint if exists user_game_progress_pkey;
  alter table public.user_game_progress
    add constraint user_game_progress_pkey
    primary key (user_id, game_id, volume);
end;
$$;

alter table public.user_game_progress enable row level security;

drop policy if exists "Users can read their own game progress"
  on public.user_game_progress;
create policy "Users can read their own game progress"
  on public.user_game_progress for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.user_game_progress from anon, authenticated;
grant select on public.user_game_progress to authenticated;

create or replace function public.complete_game_level(
  p_game_id text,
  p_volume integer,
  p_language text,
  p_level integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  completed_level integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_game_id not in (
    'songs', 'stories', 'riddles', 'tongue-twisters', 'memory',
    'shapes-colors', 'math-addition', 'number-series',
    'scrambled-words', 'science', 'world-history', 'english', 'spanish', 'puzzles',
    'art-music-quiz'
  ) then
    raise exception 'Unknown game';
  end if;

  if p_volume < 1 or p_level < 1 or p_language not in ('es', 'en') then
    raise exception 'Invalid game progress';
  end if;

  if not exists (
    select 1
      from public.game_content
      where game_id = p_game_id
        and volume = p_volume
        and language = p_language
        and level = p_level
        and is_published = true
  ) then
    raise exception 'Published game level not found';
  end if;

  insert into public.user_game_progress
    (user_id, game_id, volume)
  values
    (current_user_id, p_game_id, p_volume)
  on conflict (user_id, game_id, volume) do nothing;

  select highest_completed_level
    into completed_level
    from public.user_game_progress
    where user_id = current_user_id
      and game_id = p_game_id
      and volume = p_volume
    for update;

  if p_level <= completed_level then
    return completed_level;
  end if;

  if p_level <> completed_level + 1 then
    raise exception 'Game levels must be completed in order';
  end if;

  update public.user_game_progress
    set highest_completed_level = p_level,
        updated_at = now()
    where user_id = current_user_id
      and game_id = p_game_id
      and volume = p_volume;

  return p_level;
end;
$$;

revoke all on function public.complete_game_level(text, integer, text, integer)
  from public, anon;
grant execute on function public.complete_game_level(text, integer, text, integer)
  to authenticated;
