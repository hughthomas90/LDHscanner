insert into public.watchlists (list_type, label, normalized_value, is_active)
values
  ('institution', 'Oxford', 'university of oxford', true),
  ('institution', 'UCL', 'university college london', true),
  ('institution', 'Imperial', 'imperial college london', true),
  ('company', 'Google Health', 'google health', true),
  ('company', 'Microsoft', 'microsoft', true),
  ('keyword_include', 'Foundation models', 'foundation model', true),
  ('keyword_include', 'Remote monitoring', 'remote monitoring', true),
  ('keyword_exclude', 'Veterinary', 'veterinary', true)
on conflict (list_type, normalized_value) do nothing;

insert into public.items (
  source_type,
  source_name,
  source_id,
  title,
  abstract_text,
  source_url,
  published_date,
  first_seen_at,
  last_seen_at,
  current_status,
  fit_score,
  solicitation_score,
  reason_flags,
  disease_tags,
  modality_tags,
  institution_hits,
  company_hits,
  editorial_status,
  editor_notes,
  hash_fingerprint
)
values
  (
    'preprint',
    'Europe PMC',
    'EPMC-PREPRINT-1001',
    'Prospective multicentre evaluation of a foundation model triage assistant for chest radiograph reporting',
    'A prospective multicentre study across five NHS hospitals evaluated a foundation model assistant for radiology triage, reporting diagnostic accuracy, clinician workflow impact, and deployment considerations.',
    'https://europepmc.org/article/PPR/PPR1001',
    current_date - interval '2 days',
    timezone('utc', now()) - interval '6 hours',
    timezone('utc', now()) - interval '1 hour',
    null,
    88,
    82,
    '["matched_ai_ml","matched_imaging_ai","matched_validation","multicentre_signal","strong_study_design_signal"]'::jsonb,
    '["respiratory"]'::jsonb,
    '["ai_ml","imaging_ai","validation"]'::jsonb,
    '["University of Oxford"]'::jsonb,
    '[]'::jsonb,
    'shortlisted',
    'Good early signal for editorial commissioning.',
    'fp_epmc_1001'
  ),
  (
    'preprint',
    'medRxiv',
    'MEDRXIV-2002',
    'Remote monitoring and digital therapeutics for heart failure after discharge: a pragmatic real-world study',
    'This real-world evaluation examined remote patient monitoring and digital therapeutics after discharge for heart failure, with emphasis on implementation, adherence, and health-system workflow.',
    'https://www.medrxiv.org/content/10.1101/2026.03.10.2002v1',
    current_date - interval '5 days',
    timezone('utc', now()) - interval '10 hours',
    timezone('utc', now()) - interval '2 hours',
    null,
    84,
    76,
    '["matched_remote_monitoring","matched_digital_therapeutics","matched_real_world","matched_implementation","strong_study_design_signal"]'::jsonb,
    '["cardiology"]'::jsonb,
    '["remote_monitoring","digital_therapeutics","implementation","real_world"]'::jsonb,
    '["Imperial College London"]'::jsonb,
    '[]'::jsonb,
    'watching',
    null,
    'fp_medrxiv_2002'
  ),
  (
    'trial',
    'ClinicalTrials.gov',
    'NCT05990001',
    'Randomized trial of wearable atrial fibrillation detection with automated clinician workflow integration',
    'A randomized multicentre trial evaluating wearable-enabled atrial fibrillation screening integrated with EHR alerts and clinician workflow in secondary care.',
    'https://clinicaltrials.gov/study/NCT05990001',
    current_date - interval '40 days',
    timezone('utc', now()) - interval '18 hours',
    timezone('utc', now()) - interval '30 minutes',
    'Recruiting',
    86,
    90,
    '["matched_wearables","matched_randomized_trials","matched_ehr_workflow","multicentre_signal","actionable_trial_status"]'::jsonb,
    '["cardiology"]'::jsonb,
    '["wearables","randomized_trials","ehr_workflow"]'::jsonb,
    '["University College London"]'::jsonb,
    '["Google Health"]'::jsonb,
    'contact_soon',
    'Recruiting trial with industry involvement.',
    'fp_nct05990001'
  ),
  (
    'trial',
    'ClinicalTrials.gov',
    'NCT05990002',
    'Near-completed telehealth rehabilitation study for post-stroke recovery at home',
    'Prospective multicentre telehealth rehabilitation study using home sensors and clinician dashboards to assess function after stroke.',
    'https://clinicaltrials.gov/study/NCT05990002',
    current_date - interval '75 days',
    timezone('utc', now()) - interval '14 hours',
    timezone('utc', now()) - interval '25 minutes',
    'Active, not recruiting',
    79,
    88,
    '["matched_telemedicine","matched_remote_monitoring","matched_prospective_studies","multicentre_signal","actionable_trial_status"]'::jsonb,
    '["neurology"]'::jsonb,
    '["telemedicine","remote_monitoring","prospective_studies"]'::jsonb,
    '["King''s College London"]'::jsonb,
    '[]'::jsonb,
    'new',
    null,
    'fp_nct05990002'
  ),
  (
    'grant',
    'NIH RePORTER',
    'NIH-3001',
    'Health-system validation of AI-supported sepsis prediction in routine care',
    'Funding record for a multicentre health-system evaluation of sepsis prediction models, focused on prospective validation, fairness, and deployment.',
    'https://reporter.nih.gov/project-details/3001',
    current_date - interval '8 days',
    timezone('utc', now()) - interval '16 hours',
    timezone('utc', now()) - interval '3 hours',
    'Awarded',
    73,
    63,
    '["matched_ai_ml","matched_validation","matched_real_world","multicentre_signal"]'::jsonb,
    '["critical care"]'::jsonb,
    '["ai_ml","validation","real_world"]'::jsonb,
    '["Mayo Clinic"]'::jsonb,
    '["Microsoft"]'::jsonb,
    'new',
    'Schema support for grants is already in place.',
    'fp_nih_3001'
  )
on conflict (source_name, source_id) do nothing;

insert into public.item_snapshots (
  item_id,
  snapshot_at,
  status,
  primary_completion_date,
  completion_date,
  sponsor_name,
  raw_payload
)
select
  id,
  timezone('utc', now()) - interval '7 days',
  'Not yet recruiting',
  current_date + 45,
  current_date + 90,
  'Google Health',
  jsonb_build_object('status', 'Not yet recruiting', 'phase', 'N/A')
from public.items
where source_id = 'NCT05990001'
on conflict do nothing;

insert into public.item_snapshots (
  item_id,
  snapshot_at,
  status,
  primary_completion_date,
  completion_date,
  sponsor_name,
  raw_payload
)
select
  id,
  timezone('utc', now()) - interval '1 day',
  'Recruiting',
  current_date + 30,
  current_date + 70,
  'Google Health',
  jsonb_build_object('status', 'Recruiting', 'phase', 'N/A')
from public.items
where source_id = 'NCT05990001'
on conflict do nothing;

insert into public.item_snapshots (
  item_id,
  snapshot_at,
  status,
  primary_completion_date,
  completion_date,
  sponsor_name,
  raw_payload
)
select
  id,
  timezone('utc', now()) - interval '3 days',
  'Recruiting',
  current_date + 10,
  current_date + 30,
  'NHS Lothian',
  jsonb_build_object('status', 'Recruiting')
from public.items
where source_id = 'NCT05990002'
on conflict do nothing;
