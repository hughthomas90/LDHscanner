import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { addUtcDays, runPool, startOfUtcDay, toDateOnly } from "@/lib/utils";
import { fetchPreprintsForDateRange } from "./medrxiv";
import { buildFallbackContact, normalizeSourceRecord } from "./normalize";
import { extractContactsFromJats } from "./jats";
import { getActiveRubric } from "@/lib/data";
import { scorePaper } from "@/lib/scoring/engine";
import type { ExtractedContact } from "./types";
import { generateDigest } from "@/lib/digest";

function qualifiesForContactEnrichment(normalizedTopics: string[], title: string, abstract: string | null) {
  if (normalizedTopics.length > 0) {
    return true;
  }

  const text = `${title}\n${abstract || ""}`;
  return /\b(health|clinical|patient|care|hospital|public health|diagnostic)\b/i.test(text);
}

async function replacePaperContacts(admin: any, paperId: string, contacts: ExtractedContact[]) {
  await admin.from("paper_contacts").delete().eq("paper_id", paperId);

  if (!contacts.length) {
    return;
  }

  const payload = contacts.map((contact) => ({
    paper_id: paperId,
    contact_name: contact.contact_name,
    contact_email: contact.contact_email,
    contact_role: contact.contact_role,
    affiliation: contact.affiliation,
    orcid: contact.orcid,
    contact_url: contact.contact_url,
    source_type: contact.source_type,
    confidence: contact.confidence,
    is_public: contact.is_public,
  }));

  const { error } = await admin.from("paper_contacts").insert(payload);
  if (error) {
    throw error;
  }
}

async function upsertPaper(admin: any, paper: any) {
  const { data, error } = await admin
    .from("papers")
    .upsert(paper, { onConflict: "source_server,dedupe_key" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertScore(admin: any, scorePayload: any) {
  const { error } = await admin
    .from("paper_scores")
    .upsert(scorePayload, { onConflict: "paper_id,rubric_version_id" });

  if (error) {
    throw error;
  }
}

async function createRun(admin: any, runType: string, metadata: Record<string, unknown>) {
  const { data, error } = await admin
    .from("app_runs")
    .insert({
      run_type: runType,
      status: "running",
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function finishRun(admin: any, runId: string, status: "success" | "error", message: string, metadata?: Record<string, unknown>) {
  const { error } = await admin
    .from("app_runs")
    .update({
      status,
      message,
      finished_at: new Date().toISOString(),
      metadata,
    })
    .eq("id", runId);

  if (error) {
    throw error;
  }
}

export async function runFetchWorkflow(options?: { lookbackDays?: number; now?: Date }) {
  const now = options?.now || new Date();
  const lookbackDays = options?.lookbackDays || env.preprintLookbackDays || 2;
  const admin = createAdminClient();
  const activeRubric = await getActiveRubric();

  if (!activeRubric) {
    throw new Error("No active rubric found. Insert a rubric before running ingestion.");
  }

  const end = startOfUtcDay(now);
  const start = addUtcDays(end, -lookbackDays);
  const startDate = toDateOnly(start);
  const endDate = toDateOnly(end);

  const run = await createRun(admin, "fetch-preprints", { startDate, endDate, lookbackDays });

  try {
    const [medrxiv, biorxiv] = await Promise.all([
      fetchPreprintsForDateRange("medrxiv", startDate, endDate),
      fetchPreprintsForDateRange("biorxiv", startDate, endDate),
    ]);

    const allRecords = [...medrxiv, ...biorxiv].map(normalizeSourceRecord);

    const processed = await runPool(allRecords, 4, async (record) => {
      const fallbackContacts = buildFallbackContact(record);
      const contacts = qualifiesForContactEnrichment(record.normalized_topics, record.title, record.abstract)
        ? await extractContactsFromJats(record, fallbackContacts)
        : fallbackContacts;

      const paperRow = await upsertPaper(admin, record);
      await replacePaperContacts(admin, paperRow.id, contacts);

      const score = scorePaper(
        {
          title: paperRow.title,
          abstract: paperRow.abstract,
          category: paperRow.category,
          corresponding_institution: paperRow.corresponding_institution,
          published_doi: paperRow.published_doi,
          normalized_topics: paperRow.normalized_topics,
        },
        contacts,
        activeRubric.rubric_json,
      );

      await upsertScore(admin, {
        paper_id: paperRow.id,
        rubric_version_id: activeRubric.id,
        fit_score: score.fitScore,
        impact_score: score.impactScore,
        contactability_score: score.contactabilityScore,
        penalty_total: score.penaltyTotal,
        priority_score: score.priorityScore,
        score_band: score.scoreBand,
        explanation_json: score.explanationJson,
      });

      return {
        id: paperRow.id,
        priority: score.priorityScore,
        band: score.scoreBand,
      };
    });

    const topCount = processed.filter((row) => row.band === "high").length;
    const reviewCount = processed.filter((row) => row.band === "review").length;

    const dailyDigest = await generateDigest("daily", now);
    let weeklyDigest = null;
    if (now.getUTCDay() === 5) {
      weeklyDigest = await generateDigest("weekly", now);
    }

    const metadata = {
      startDate,
      endDate,
      lookbackDays,
      processed: processed.length,
      highPriority: topCount,
      reviewCount,
      dailyDigestId: dailyDigest?.id || null,
      weeklyDigestId: weeklyDigest?.id || null,
    };

    await finishRun(
      admin,
      run.id,
      "success",
      `Processed ${processed.length} preprints (${topCount} high priority, ${reviewCount} review).`,
      metadata,
    );

    return metadata;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error";
    await finishRun(admin, run.id, "error", message, {
      startDate,
      endDate,
      lookbackDays,
    });
    throw error;
  }
}
