import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { addUtcDays, formatDate, formatScore, startOfUtcDay, toDateOnly } from "@/lib/utils";
import { getActiveRubric } from "@/lib/data";
import { topicLabel } from "@/lib/scoring/topic-taxonomy";

function buildDigestMarkdown(type: "daily" | "weekly", digestDate: string, rows: any[]) {
  const heading = type === "daily" ? "Daily preprint digest" : "Weekly preprint digest";
  const counts = rows.reduce(
    (acc, row) => {
      acc[row.score_band] += 1;
      return acc;
    },
    { high: 0, review: 0, low: 0 } as Record<string, number>,
  );

  const topicCounts = new Map<string, number>();
  for (const row of rows) {
    for (const topicKey of row.paper?.normalized_topics || []) {
      topicCounts.set(topicKey, (topicCounts.get(topicKey) || 0) + 1);
    }
  }

  const topTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => `- ${topicLabel(key)} (${count})`);

  const topPapers = rows.slice(0, 10).map((row, index) => {
    const reasons = (row.explanation_json?.fit_reasons || [])
      .slice(0, 2)
      .join("; ");
    const contact = row.paper?.corresponding_author
      ? `${row.paper.corresponding_author}${row.paper.corresponding_institution ? `, ${row.paper.corresponding_institution}` : ""}`
      : "No corresponding-author metadata";
    return `${index + 1}. **${row.paper?.title || "Untitled"}** — Priority ${formatScore(
      row.priority_score,
    )}; ${row.score_band.toUpperCase()}. Why: ${reasons || "Matched scoring signals"}. Contact: ${contact}.`;
  });

  return [
    `# ${heading} — ${formatDate(digestDate)}`,
    "",
    `Scanned and ranked ${rows.length} papers with the currently active rubric.`,
    "",
    `- High priority: ${counts.high}`,
    `- Editor review: ${counts.review}`,
    `- Low priority: ${counts.low}`,
    "",
    "## Emerging themes",
    ...(topTopics.length ? topTopics : ["- No topic clusters identified yet."]),
    "",
    "## Top papers",
    ...(topPapers.length ? topPapers : ["No papers met the digest threshold."]),
  ].join("\n");
}

export async function generateDigest(type: "daily" | "weekly", now = new Date()) {
  const activeRubric = await getActiveRubric();
  if (!activeRubric) {
    throw new Error("No active rubric configured");
  }

  const admin = createAdminClient();
  const end = startOfUtcDay(now);
  const start = type === "daily" ? addUtcDays(end, -1) : addUtcDays(end, -7);
  const limit = type === "daily" ? env.dailyDigestLimit : env.weeklyDigestLimit;
  const digestDate = toDateOnly(end);

  const { data, error } = await admin
    .from("paper_scores")
    .select(
      `
      priority_score,
      score_band,
      explanation_json,
      paper:papers (
        id,
        title,
        normalized_topics,
        corresponding_author,
        corresponding_institution,
        posted_date
      )
    `,
    )
    .eq("rubric_version_id", activeRubric.id)
    .order("priority_score", { ascending: false })
    .limit(500);

  if (error) {
    throw error;
  }

  const rows = ((data || []) as any[])
    .filter((row) => {
      const posted = row.paper?.posted_date;
      return posted && posted >= toDateOnly(start) && posted <= digestDate;
    })
    .slice(0, limit);

  const summary = buildDigestMarkdown(type, digestDate, rows);

  const payload = {
    digest_date: digestDate,
    digest_type: type,
    title: `${type === "daily" ? "Daily" : "Weekly"} digest — ${digestDate}`,
    summary_markdown: summary,
    paper_ids: rows.map((row) => row.paper?.id).filter(Boolean),
  };

  const { data: digestRow, error: upsertError } = await admin
    .from("digests")
    .upsert(payload, { onConflict: "digest_date,digest_type" })
    .select()
    .single();

  if (upsertError) {
    throw upsertError;
  }

  return digestRow;
}
