import { generateDailyDigestAction, generateWeeklyDigestAction, runFetchWorkflowAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { listAppRuns, listDigests } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DigestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireUser();
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";

  const [digests, runs] = await Promise.all([listDigests(), listAppRuns(25)]);

  return (
    <main>
      <div className="page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1>Digests and run history</h1>
          <p>
            This page keeps the operational history visible: scheduled runs, manual refreshes, and the
            generated daily and weekly summaries.
          </p>
        </div>
        <div className="inline-links">
          <form action={runFetchWorkflowAction}>
            <button className="primary" type="submit">
              Run fetch
            </button>
          </form>
          <form action={generateDailyDigestAction}>
            <button type="submit">Refresh daily digest</button>
          </form>
          <form action={generateWeeklyDigestAction}>
            <button type="submit">Refresh weekly digest</button>
          </form>
        </div>
      </div>

      {notice ? <div className="notice">Digest refresh complete.</div> : null}

      <div className="two-column">
        <div className="card">
          <div className="section-title">
            <h2>Digests</h2>
            <span className="muted">{digests.length} stored</span>
          </div>
          <div className="stack">
            {digests.map((digest: any) => (
              <div key={digest.id} className="card" style={{ boxShadow: "none" }}>
                <div className="section-title">
                  <strong>{digest.title}</strong>
                  <span className="muted">{digest.digest_type}</span>
                </div>
                <div className="muted">{formatDate(digest.digest_date)}</div>
                <div className="markdown" style={{ marginTop: 12 }}>
                  {digest.summary_markdown}
                </div>
              </div>
            ))}
            {!digests.length ? <div className="muted">No digests generated yet.</div> : null}
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Run history</h2>
            <span className="muted">{runs.length} recent runs</span>
          </div>
          <div className="stack">
            {runs.map((run: any) => (
              <div key={run.id} className="card" style={{ boxShadow: "none" }}>
                <strong>{run.run_type}</strong>
                <div className="muted">
                  {formatDateTime(run.started_at)} → {run.finished_at ? formatDateTime(run.finished_at) : "still running"}
                </div>
                <div className="muted">{run.status.toUpperCase()}</div>
                <div>{run.message || "No message recorded."}</div>
                <pre className="json">{JSON.stringify(run.metadata || {}, null, 2)}</pre>
              </div>
            ))}
            {!runs.length ? <div className="muted">No runs logged yet.</div> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
