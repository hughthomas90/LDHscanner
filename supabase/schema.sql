create extension if not exists pgcrypto;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('preprint', 'trial', 'grant')),
  source_name text not null,
  source_id text not null,
  title text not null,
  abstract_text text,
  source_url text,
  published_date date,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  current_status text,
  fit_score numeric(5,2) not null default 0,
  solicitation_score numeric(5,2) not null default 0,
  reason_flags jsonb not null default '[]'::jsonb,
  disease_tags jsonb not null default '[]'::jsonb,
  modality_tags jsonb not null default '[]'::jsonb,
  institution_hits jsonb not null default '[]'::jsonb,
  company_hits jsonb not null default '[]'::jsonb,
  editorial_status text not null default 'new' check (
    editorial_status in ('new', 'watching', 'shortlisted', 'contact_soon', 'contacted', 'ignored')
  ),
  editor_notes text,
  corresponding_author_name text,
  corresponding_author_email text,
  primary_investigator_name text,
  primary_investigator_email text,
  trial_enrollment integer,
  hash_fingerprint text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_name, source_id)
);

create table if not exists public.item_snapshots (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  snapshot_at timestamptz not null default timezone('utc', now()),
  status text,
  primary_completion_date date,
  completion_date date,
  sponsor_name text,
  raw_payload jsonb not null default '{}'::jsonb
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  list_type text not null check (
    list_type in ('institution', 'company', 'keyword_include', 'keyword_exclude')
  ),
  label text not null,
  normalized_value text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (list_type, normalized_value)
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  status text not null check (status in ('running', 'success', 'error')),
  records_seen integer not null default 0,
  records_inserted integer not null default 0,
  records_updated integer not null default 0,
  error_text text
);

create table if not exists public.editor_actions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  action_type text not null check (
    action_type in ('ignore', 'watching', 'shortlisted', 'contact_soon', 'contacted', 'note')
  ),
  action_by uuid not null references auth.users(id),
  action_at timestamptz not null default timezone('utc', now()),
  notes text
);

create table if not exists public.preprint_selections (
  preprint_id uuid not null references public.items(id) on delete cascade,
  editor_id uuid not null references auth.users(id) on delete cascade,
  selected_at timestamptz not null default timezone('utc', now()),
  primary key (preprint_id, editor_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
before update on public.items
for each row
execute function public.set_updated_at();

create index if not exists idx_items_source_type on public.items(source_type);
create index if not exists idx_items_published_date on public.items(published_date desc);
create index if not exists idx_items_editorial_status on public.items(editorial_status);
create index if not exists idx_items_scores on public.items(fit_score desc, solicitation_score desc);
create index if not exists idx_items_hash on public.items(hash_fingerprint);
create index if not exists idx_snapshots_item_id on public.item_snapshots(item_id, snapshot_at desc);
create index if not exists idx_watchlists_type on public.watchlists(list_type, is_active);
create index if not exists idx_ingestion_runs_source on public.ingestion_runs(source_name, started_at desc);
create index if not exists idx_editor_actions_item on public.editor_actions(item_id, action_at desc);
create index if not exists idx_preprint_selections_editor on public.preprint_selections(editor_id, selected_at desc);

alter table public.items enable row level security;
alter table public.item_snapshots enable row level security;
alter table public.watchlists enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.editor_actions enable row level security;
alter table public.preprint_selections enable row level security;

drop policy if exists "authenticated users can read items" on public.items;
create policy "authenticated users can read items"
on public.items
for select
to authenticated
using (true);

drop policy if exists "authenticated users can update items" on public.items;
create policy "authenticated users can update items"
on public.items
for update
to authenticated
using (true)
with check (true);

drop policy if exists "service role manages items" on public.items;
create policy "service role manages items"
on public.items
for all
to service_role
using (true)
with check (true);

drop policy if exists "authenticated users can read snapshots" on public.item_snapshots;
create policy "authenticated users can read snapshots"
on public.item_snapshots
for select
to authenticated
using (true);

drop policy if exists "service role manages snapshots" on public.item_snapshots;
create policy "service role manages snapshots"
on public.item_snapshots
for all
to service_role
using (true)
with check (true);

drop policy if exists "authenticated users can read watchlists" on public.watchlists;
create policy "authenticated users can read watchlists"
on public.watchlists
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage watchlists" on public.watchlists;
create policy "authenticated users can manage watchlists"
on public.watchlists
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can read ingestion runs" on public.ingestion_runs;
create policy "authenticated users can read ingestion runs"
on public.ingestion_runs
for select
to authenticated
using (true);

drop policy if exists "service role manages ingestion runs" on public.ingestion_runs;
create policy "service role manages ingestion runs"
on public.ingestion_runs
for all
to service_role
using (true)
with check (true);

drop policy if exists "authenticated users can read editor actions" on public.editor_actions;
create policy "authenticated users can read editor actions"
on public.editor_actions
for select
to authenticated
using (true);

drop policy if exists "authenticated users can insert editor actions" on public.editor_actions;
create policy "authenticated users can insert editor actions"
on public.editor_actions
for insert
to authenticated
with check (auth.uid() = action_by);

drop policy if exists "authenticated users can update own editor actions" on public.editor_actions;
create policy "authenticated users can update own editor actions"
on public.editor_actions
for update
to authenticated
using (auth.uid() = action_by)
with check (auth.uid() = action_by);

drop policy if exists "service role manages editor actions" on public.editor_actions;
create policy "service role manages editor actions"
on public.editor_actions
for all
to service_role
using (true)
with check (true);

drop policy if exists "authenticated users can read own preprint selections" on public.preprint_selections;
create policy "authenticated users can read own preprint selections"
on public.preprint_selections
for select
to authenticated
using (auth.uid() = editor_id);

drop policy if exists "authenticated users can insert own preprint selections" on public.preprint_selections;
create policy "authenticated users can insert own preprint selections"
on public.preprint_selections
for insert
to authenticated
with check (auth.uid() = editor_id);

drop policy if exists "authenticated users can delete own preprint selections" on public.preprint_selections;
create policy "authenticated users can delete own preprint selections"
on public.preprint_selections
for delete
to authenticated
using (auth.uid() = editor_id);

drop policy if exists "service role manages preprint selections" on public.preprint_selections;
create policy "service role manages preprint selections"
on public.preprint_selections
for all
to service_role
using (true)
with check (true);
