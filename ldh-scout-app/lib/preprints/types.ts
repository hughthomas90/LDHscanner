export interface SourcePreprintRecord {
  doi?: string;
  title: string;
  authors?: string;
  author_corresponding?: string;
  author_corresponding_institution?: string;
  date: string;
  version?: string;
  category?: string;
  jatsxml?: string;
  abstract?: string;
  published?: string;
  server: "medrxiv" | "biorxiv";
  type?: string;
  license?: string;
}

export interface ExtractedContact {
  contact_name: string | null;
  contact_email: string | null;
  contact_role: string;
  affiliation: string | null;
  orcid: string | null;
  contact_url: string | null;
  source_type: string;
  confidence: "high" | "medium" | "low";
  is_public: boolean;
}

export interface NormalizedPreprint {
  source_server: "medrxiv" | "biorxiv";
  source_doi: string | null;
  source_identifier: string;
  dedupe_key: string;
  title: string;
  abstract: string | null;
  authors_json: Array<{ name: string }>;
  corresponding_author: string | null;
  corresponding_institution: string | null;
  posted_date: string;
  version: string | null;
  category: string | null;
  jats_xml_url: string | null;
  fulltext_url: string | null;
  published_doi: string | null;
  published_url: string | null;
  raw_payload: SourcePreprintRecord;
  normalized_topics: string[];
}
