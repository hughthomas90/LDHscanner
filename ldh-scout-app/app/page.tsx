import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardRows, listAppRuns } from "@/lib/data";
import { formatDate, formatDateTime, formatScore, truncate } from "@/lib/utils";
import ScoreBadge from "@/components/score-badge";
import { isAppConfigured } from "@/lib/env";
import { runFetchWorkflowAction } from "@/app/actions";
import { topicLabel } from "@/lib/scoring/topic-taxonomy";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function SetupCard() {
  return (
    <main>
      <div className="page-header">
        <div>
          <div className="kicker">Setup</div>
          <h1>LDH Scout is almost ready</h1>
          <p>
            Add the Supabase and Vercel environment variables, run the schema in Supabase, and insert
            the first active rubric.
          </p>
        </div>
      </div>

      <div className="card stack">
        <div>
          <h2>Checklist</h2>
          <ol>
            <li>Create a Supabase project.</li>
            <li>Run <code>supabase/schema.sql</code> in the SQL editor.</li>
            <li>Insert the JSON in <code>scoring-rubrics/ldh-default-v1.json</code> as the first active rubric.</li>
            <li>Add the variables from <code>.env.example</code> in Vercel.</li>
            <li>Open the site again and sign in with your editorial email.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!isAppConfigured()) {
    return <SetupCard />;
  }

  await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const band = typeof params.band === "string" ? params.band : "";
  const source = typeof params.source === "string" ? params.source : "";
  const notice = typeof params.notice === "string" ? params.notice : "";

  const [{ activeRubric, rows, counts }, appRuns] = await Promise.all([
    getDashboardRows({ q, band, source, limit: 120 }),
    listAppRuns(5),
  ]);

  if (!activeRubric) {
    return (
      <main>
        <div className="card">
          No active rubric is configured yet. Load the schema and add the first rubric row in Supabase.
        </div>
      </main>
    );
  }

  const latestRun = appRuns[0];

  return (
    <main>
      <div className="page-header">
        <div>
          <div className="kicker">Dashboard</div>
          <h1>New preprints for LDH</h1>
          <p>
            Ranked using the active rubric <strong>{activeRubric.version_name}</strong>. The list below
            is intended as an editorial triage queue rather than a generic search result.
          </p>
        </div>
        <div className="inline-links">
          <form action={runFetchWorkflowAction}>
            <button className="primary" type="submit">
              Run fetch now
            </button>
          </form>
          <Link className="secondary-link" href="/admin/rubric">
            Edit rubric
          </Link>
          <Link className="secondary-link" href="/admin/digests">
            View digests
          </Link>
        </div>
      </div>

      {notice === "fetched" ? (
        <div className="notice">Fetch completed and the daily digest was refreshed.</div>
      ) : null}

      <div className="grid stats">
        <div className="card stat-card">
          <div className="label">High priority</div>
          <div className="value">{counts.high}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Editor review</div>
          <div className="value">{counts.review}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Low priority</div>
          <div className="value">{counts.low}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Latest run</div>
          <div className="value" style={{ fontSize: "1rem" }}>
            {latestRun ? formatDateTime(latestRun.started_at) : "No runs yet"}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <h2>Filters</h2>
          {latestRun ? (
            <div className="muted">
              {latestRun.status.toUpperCase()} — {latestRun.message || "No run summary"}
            </div>
          ) : null}
        </div>
        <form className="filters" method="get">
          <label>
            Search title or abstract
            <input name="q" defaultValue={q} placeholder="e.g. remote monitoring" />
          </label>
          <label>
            Score band
            <select name="band" defaultValue={band}>
              <option value="">All bands</option>
              <option value="high">High priority</option>
              <option value="review">Editor review</option>
              <option value="low">Low priority</option>
            </select>
          </label>
          <label>
            Source server
            <select name="source" defaultValue={source}>
              <option value="">All sources</option>
              <option value="medrxiv">medRxiv</option>
              <option value="biorxiv">bioRxiv</option>
            </select>
          </label>
          <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
            <button className="primary" type="submit">
              Apply
            </button>
            <Link className="secondary-link" href="/">
              Reset
            </Link>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Ranked papers</h2>
          <div className="muted">{rows.length} rows</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Score</th>
                <th>Paper</th>
                <th>Topics</th>
                <th>Contact</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => {
                const paper = row.paper || {};
                const reasons = (row.explanation_json?.fit_reasons || []).slice(0, 2);

                return (
                  <tr key={row.id}>
                    <td>
                      <ScoreBadge value={row.priority_score} band={row.score_band} />
                      <div className="muted" style={{ marginTop: 8 }}>
                        Fit {formatScore(row.fit_score)} · Impact {formatScore(row.impact_score)} · Contact {formatScore(row.contactability_score)}
                      </div>
                    </td>
                    <td>
                      <div className="paper-title">
                        <Link href={`/papers/${paper.id}`}>{paper.title}</Link>
                      </div>
                      <div className="muted" style={{ marginBottom: 8 }}>
                        {truncate(paper.abstract, 220)}
                      </div>
                      <div className="reason-list">
                        {reasons.length ? reasons.map((reason: string) => <span key={reason}>{reason}</span>) : <span>No explanation captured</span>}
                      </div>
                    </td>
                    <td>
                      <div className="topic-list">
                        {(paper.normalized_topics || []).map((key: string) => (
                          <span className="topic-pill" key={key}>
                            {topicLabel(key)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div>{paper.corresponding_author || "—"}</div>
                      <div className="muted">{paper.corresponding_institution || "No institution metadata"}</div>
                    </td>
                    <td>
                      <div>{paper.source_server}</div>
                      <div className="muted">{formatDate(paper.posted_date)}</div>
                      {paper.published_doi ? <div className="muted">Published DOI linked</div> : null}
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No papers matched the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
