import { inferTopicKeys } from "@/lib/scoring/topic-taxonomy";
import { slugify } from "@/lib/utils";
import type { ExtractedContact, NormalizedPreprint, SourcePreprintRecord } from "./types";

function parseAuthors(authorsRaw?: string) {
  if (!authorsRaw) {
    return [];
  }

  const parts = authorsRaw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    return parts.map((name) => ({ name }));
  }

  return authorsRaw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

function buildFulltextUrl(server: string, doi?: string, version?: string) {
  if (!doi) {
    return null;
  }
  const safeVersion = version ? `v${version}` : "";
  return `https://www.${server}.org/content/${doi}${safeVersion}`;
}

export function normalizeSourceRecord(record: SourcePreprintRecord): NormalizedPreprint {
  const sourceDoi = record.doi?.trim() || null;
  const sourceIdentifier = sourceDoi || `${slugify(record.title)}-${record.date}`;
  const dedupeKey = sourceDoi || sourceIdentifier;
  const text = `${record.title}\n${record.abstract || ""}\n${record.category || ""}`;
  const normalizedTopics = inferTopicKeys(text);

  return {
    source_server: record.server,
    source_doi: sourceDoi,
    source_identifier: sourceIdentifier,
    dedupe_key: dedupeKey,
    title: record.title.trim(),
    abstract: record.abstract?.trim() || null,
    authors_json: parseAuthors(record.authors),
    corresponding_author: record.author_corresponding?.trim() || null,
    corresponding_institution: record.author_corresponding_institution?.trim() || null,
    posted_date: record.date,
    version: record.version?.trim() || null,
    category: record.category?.trim() || null,
    jats_xml_url: record.jatsxml?.trim() || null,
    fulltext_url: buildFulltextUrl(record.server, sourceDoi || undefined, record.version),
    published_doi:
      record.published && record.published !== "NA" ? record.published.trim() : null,
    published_url:
      record.published && record.published !== "NA"
        ? `https://doi.org/${record.published.trim()}`
        : null,
    raw_payload: record,
    normalized_topics: normalizedTopics,
  };
}

export function buildFallbackContact(record: NormalizedPreprint): ExtractedContact[] {
  if (!record.corresponding_author && !record.corresponding_institution) {
    return [];
  }

  return [
    {
      contact_name: record.corresponding_author,
      contact_email: null,
      contact_role: "corresponding author",
      affiliation: record.corresponding_institution,
      orcid: null,
      contact_url: null,
      source_type: "api_metadata",
      confidence: record.corresponding_author ? "medium" : "low",
      is_public: true,
    },
  ];
}
