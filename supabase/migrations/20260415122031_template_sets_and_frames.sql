-- Template sets: one row per "Save to template" (gallery item / animation).
-- Template frames: one row per editor frame; layers JSON matches app Layer[] (editTypes.ts).
-- Before insert, replace blob: URLs in layer.src with Storage paths/URLs under template-assets.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.template_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled template',
  canvas_width integer not null check (canvas_width > 0),
  canvas_height integer not null check (canvas_height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.template_sets is
  'User-owned template project shown as one card in the gallery; contains many frames.';

create table public.template_frames (
  id uuid primary key default gen_random_uuid(),
  template_set_id uuid not null references public.template_sets (id) on delete cascade,
  frame_index integer not null check (frame_index >= 0),
  -- Layer[] from the editor: { id, name, type, src?, width?, ... }
  layers jsonb not null default '[]'::jsonb,
  preview_path text,
  delay_ms integer check (delay_ms is null or delay_ms >= 0),
  created_at timestamptz not null default now(),
  unique (template_set_id, frame_index)
);

comment on column public.template_frames.layers is
  'JSON array of layer objects (image | text | blank). Persist image src as Storage URLs, not blob:.';
comment on column public.template_frames.preview_path is
  'Optional path in template-assets bucket for this frame thumbnail.';
comment on column public.template_frames.delay_ms is
  'GIF frame delay in ms when reconstructing animation; null if unknown.';

create index template_sets_user_created_idx
  on public.template_sets (user_id, created_at desc);

create index template_frames_set_order_idx
  on public.template_frames (template_set_id, frame_index);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_template_sets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger template_sets_set_updated_at
  before update on public.template_sets
  for each row
  execute function public.set_template_sets_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: template_sets
-- ---------------------------------------------------------------------------

alter table public.template_sets enable row level security;

create policy "template_sets_select_own"
  on public.template_sets  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "template_sets_insert_own"
  on public.template_sets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "template_sets_update_own"
  on public.template_sets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "template_sets_delete_own"
  on public.template_sets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- RLS: template_frames (via parent set ownership)
-- ---------------------------------------------------------------------------

alter table public.template_frames enable row level security;

create policy "template_frames_select_via_set"
  on public.template_frames
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.template_sets s
      where s.id = template_frames.template_set_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "template_frames_insert_via_set"
  on public.template_frames
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.template_sets s
      where s.id = template_frames.template_set_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "template_frames_update_via_set"
  on public.template_frames
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.template_sets s
      where s.id = template_frames.template_set_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.template_sets s
      where s.id = template_frames.template_set_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "template_frames_delete_via_set"
  on public.template_frames
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.template_sets s
      where s.id = template_frames.template_set_id
        and s.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: layer images + frame previews (private bucket)
-- Path convention: {auth.uid()}/{template_set_id or temp}/{filename}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'template-assets',
  'template-assets',
  false,
  10485760,
  array['image/png', 'image/gif', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

create policy "template_assets_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'template-assets'
    and coalesce((string_to_array(name, '/'))[1], '') = (select auth.uid())::text
  );

create policy "template_assets_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'template-assets'
    and coalesce((string_to_array(name, '/'))[1], '') = (select auth.uid())::text
  );

create policy "template_assets_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'template-assets'
    and coalesce((string_to_array(name, '/'))[1], '') = (select auth.uid())::text
  )
  with check (
    bucket_id = 'template-assets'
    and coalesce((string_to_array(name, '/'))[1], '') = (select auth.uid())::text
  );

create policy "template_assets_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'template-assets'
    and coalesce((string_to_array(name, '/'))[1], '') = (select auth.uid())::text
  );
