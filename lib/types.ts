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
  hash_fingerprint: string;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  newToday: number;
  changedTrials: number;
  highPriority: number;
  watching: number;
};
