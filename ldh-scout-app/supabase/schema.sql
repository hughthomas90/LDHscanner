create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists papers (
  id uuid primary key default gen_random_uuid(),
  source_server text not null,
  source_doi text,
  source_identifier text not null,
  dedupe_key text not null,
  title text not null,
  abstract text,
  authors_json jsonb not null default '[]'::jsonb,
  corresponding_author text,
  corresponding_institution text,
  posted_date date not null,
  version text,
  category text,
  jats_xml_url text,
  fulltext_url text,
  published_doi text,
  published_url text,
  raw_payload jsonb not null,
  normalized_topics text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists papers_source_unique_idx
  on papers (source_server, dedupe_key);

drop trigger if exists papers_set_updated_at on papers;
create trigger papers_set_updated_at
before update on papers
for each row execute procedure set_updated_at();

create table if not exists paper_contacts (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references papers(id) on delete cascade,
  contact_name text,
  contact_email text,
  contact_role text not null,
  affiliation text,
  orcid text,
  contact_url text,
  source_type text not null,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rubric_versions (
  id uuid primary key default gen_random_uuid(),
  version_name text not null unique,
  status text not null check (status in ('draft', 'active', 'archived')),
  rubric_json jsonb not null,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create unique index if not exists rubric_single_active_idx
  on rubric_versions ((status))
  where status = 'active';

create table if not exists paper_scores (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references papers(id) on delete cascade,
  rubric_version_id uuid not null references rubric_versions(id) on delete restrict,
  fit_score numeric(5,2) not null,
  impact_score numeric(5,2) not null,
  contactability_score numeric(5,2) not null,
  penalty_total numeric(5,2) not null default 0,
  priority_score numeric(5,2) not null,
  score_band text not null check (score_band in ('high', 'review', 'low')),
  explanation_json jsonb not null,
  created_at timestamptz not null default now(),
  unique (paper_id, rubric_version_id)
);

create table if not exists digests (
  id uuid primary key default gen_random_uuid(),
  digest_date date not null,
  digest_type text not null check (digest_type in ('daily', 'weekly')),
  title text not null,
  summary_markdown text not null,
  paper_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (digest_date, digest_type)
);

create table if not exists app_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running', 'success', 'error')),
  message text,
  metadata jsonb
);

create or replace view active_rubric as
select *
from rubric_versions
where status = 'active'
order by activated_at desc nulls last, created_at desc
limit 1;
