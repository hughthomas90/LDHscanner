export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type ItemRow = {
  id: string;
  source_type: "preprint" | "trial" | "grant";
  source_name: string;
  source_id: string;
  title: string;
  abstract_text: string | null;
  source_url: string | null;
  published_date: string | null;
  first_seen_at: string;
  last_seen_at: string;
  current_status: string | null;
  fit_score: number;
  solicitation_score: number;
  reason_flags: JsonValue[];
  disease_tags: JsonValue[];
  modality_tags: JsonValue[];
  institution_hits: JsonValue[];
  company_hits: JsonValue[];
  editorial_status: string;
  editor_notes: string | null;
  corresponding_author_name: string | null;
  corresponding_author_email: string | null;
  primary_investigator_name: string | null;
  primary_investigator_email: string | null;
  trial_enrollment: number | null;
  hash_fingerprint: string;
  created_at: string;
  updated_at: string;
};

export type ItemSnapshotRow = {
  id: string;
  item_id: string;
  snapshot_at: string;
  status: string | null;
  primary_completion_date: string | null;
  completion_date: string | null;
  sponsor_name: string | null;
  raw_payload: JsonValue;
};

export type PreprintRow = ItemRow & {
  source_type: "preprint";
};

export type TrialRow = ItemRow & {
  source_type: "trial";
};

export type TrialWithSnapshot = TrialRow & {
  latest_snapshot: ItemSnapshotRow | null;
  days_until_primary_completion: number | null;
  days_until_completion: number | null;
};

export type DashboardStats = {
  newToday: number;
  changedTrials: number;
  highPriority: number;
  watching: number;
};
