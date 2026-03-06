import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, truncate } from "@/lib/utils";
import { topicLabel } from "@/lib/scoring/topic-taxonomy";
import type { RubricVersionRow } from "@/lib/scoring/rubric";
import { scorePaper } from "@/lib/scoring/engine";
import type { ExtractedContact } from "@/lib/preprints/types";

export async function getActiveRubric(): Promise<RubricVersionRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("active_rubric").select("*").limit(1).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as RubricVersionRow;
}

export async function listRubricVersions() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("rubric_versions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as RubricVersionRow[];
}

export async function getRubricVersion(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.from("rubric_versions").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data as RubricVersionRow;
}

export async function getDashboardRows(filters: {
  q?: string;
  band?: string;
  source?: string;
  limit?: number;
}) {
  const activeRubric = await getActiveRubric();
  if (!activeRubric) {
    return { activeRubric: null, rows: [], counts: { high: 0, review: 0, low: 0 } };
  }

  const admin = createAdminClient();
  let query = admin
    .from("paper_scores")
    .select(
      `
      id,
      fit_score,
      impact_score,
      contactability_score,
      penalty_total,
      priority_score,
      score_band,
      explanation_json,
      paper:papers (
        id,
        title,
        abstract,
        source_server,
        source_doi,
        fulltext_url,
        posted_date,
        category,
        normalized_topics,
        corresponding_author,
        corresponding_institution,
        published_url,
        published_doi
      )
    `,
    )
    .eq("rubric_version_id", activeRubric.id)
    .order("priority_score", { ascending: false })
    .limit(filters.limit || 100);

  if (filters.band) {
    query = query.eq("score_band", filters.band);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  let rows = (data || []) as any[];

  if (filters.source) {
    rows = rows.filter((row) => (row.paper?.source_server || "") === filters.source);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter((row) => {
      const paper = row.paper || {};
      return `${paper.title || ""} ${paper.abstract || ""} ${(paper.normalized_topics || []).join(" ")}`
        .toLowerCase()
        .includes(q);
    });
  }

  const counts = rows.reduce(
    (acc, row) => {
      acc[row.score_band] += 1;
      return acc;
    },
    { high: 0, review: 0, low: 0 } as Record<string, number>,
  );

  return { activeRubric, rows, counts };
}

export async function getPaperDetail(id: string) {
  const admin = createAdminClient();
  const activeRubric = await getActiveRubric();

  const { data: paper, error: paperError } = await admin.from("papers").select("*").eq("id", id).single();
  if (paperError) {
    throw paperError;
  }

  const { data: contacts, error: contactsError } = await admin
    .from("paper_contacts")
    .select("*")
    .eq("paper_id", id)
    .order("created_at", { ascending: true });
  if (contactsError) {
    throw contactsError;
  }

  let score = null;
  if (activeRubric) {
    const { data: scoreRow } = await admin
      .from("paper_scores")
      .select("*")
      .eq("paper_id", id)
      .eq("rubric_version_id", activeRubric.id)
      .maybeSingle();
    score = scoreRow;
  }

  return { paper, contacts: (contacts || []) as ExtractedContact[], score, activeRubric };
}

export async function listDigests() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("digests").select("*").order("digest_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function listAppRuns(limit = 20) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getRubricPreview(previewRubricId: string) {
  const admin = createAdminClient();
  const [activeRubric, previewRubric] = await Promise.all([getActiveRubric(), getRubricVersion(previewRubricId)]);

  if (!activeRubric) {
    return null;
  }

  const { data: papers, error } = await admin
    .from("papers")
    .select("*")
    .order("posted_date", { ascending: false })
    .limit(40);

  if (error) {
    throw error;
  }

  const paperIds = (papers || []).map((paper: any) => paper.id);
  const { data: contacts } = await admin.from("paper_contacts").select("*").in("paper_id", paperIds);

  const contactsByPaper = new Map<string, ExtractedContact[]>();
  for (const contact of contacts || []) {
    const bucket = contactsByPaper.get(contact.paper_id) || [];
    bucket.push(contact);
    contactsByPaper.set(contact.paper_id, bucket);
  }

  const comparisons = (papers || []).map((paper: any) => {
    const paperContacts = contactsByPaper.get(paper.id) || [];
    const activeScore = scorePaper(paper, paperContacts, activeRubric.rubric_json);
    const previewScore = scorePaper(paper, paperContacts, previewRubric.rubric_json);

    return {
      paper_id: paper.id,
      title: paper.title,
      source_server: paper.source_server,
      posted_date: formatDate(paper.posted_date),
      topics: (paper.normalized_topics || []).map((key: string) => topicLabel(key)).join(", "),
      active_score: activeScore.priorityScore,
      preview_score: previewScore.priorityScore,
      delta: Number((previewScore.priorityScore - activeScore.priorityScore).toFixed(1)),
      preview_band: previewScore.scoreBand,
      summary: truncate((previewScore.explanationJson.summary as string) || "", 120),
    };
  });

  comparisons.sort((a: any, b: any) => Math.abs(b.delta) - Math.abs(a.delta));
  return { activeRubric, previewRubric, comparisons };
}
