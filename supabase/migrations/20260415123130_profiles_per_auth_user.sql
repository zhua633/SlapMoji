-- One public.profiles row per Supabase Auth user. Created automatically on signup.
-- template_sets.user_id already references auth.users — templates stay per authenticated user.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application user row; use id = auth.uid() for joins. Templates use template_sets.user_id (same id).';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_template_sets_updated_at();

alter table public.profiles enable row level security;

-- Row is created by handle_new_user(); clients update their own row.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Optional: allow user to delete their profile row (auth user delete is separate in dashboard / admin API).
create policy "profiles_delete_own"
  on public.profiles
  for delete
  to authenticated
  using ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), '')
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Syncs auth.users signup into public.profiles. Do not use user_metadata for authorization.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
