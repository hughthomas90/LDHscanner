import { activateRubricAction, saveRubricDraftAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { getActiveRubric, getRubricPreview, listRubricVersions } from "@/lib/data";
import { rubricToFormFields } from "@/lib/scoring/rubric";
import { formatDateTime } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function noticeText(notice?: string) {
  if (notice === "saved") {
    return "Draft rubric saved. Preview results are shown below.";
  }
  if (notice === "activated") {
    return "Draft rubric activated. New fetch runs will use it immediately.";
  }
  return "";
}

export default async function RubricAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireUser();
  const params = await searchParams;
  const previewId = typeof params.preview === "string" ? params.preview : "";
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";

  const [activeRubric, versions, preview] = await Promise.all([
    getActiveRubric(),
    listRubricVersions(),
    previewId ? getRubricPreview(previewId) : Promise.resolve(null),
  ]);

  if (!activeRubric) {
    return (
      <main>
        <div className="card">No active rubric exists yet. Insert the default JSON in Supabase first.</div>
      </main>
    );
  }

  const fields = rubricToFormFields(activeRubric.rubric_json);

  return (
    <main>
      <div className="page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1>Rubric editor</h1>
          <p>
            Most routine editorial tuning should happen here, without changing code or redeploying.
          </p>
        </div>
      </div>

      {notice ? <div className="notice">{noticeText(notice)}</div> : null}
      {error ? <div className="notice">Error: {decodeURIComponent(error)}</div> : null}

      <div className="two-column">
        <div className="stack">
          <div className="card">
            <div className="section-title">
              <h2>Current active rubric</h2>
              <span className="muted">{activeRubric.version_name}</span>
            </div>
            <div className="stack">
              <div>
                <strong>Description</strong>
                <div className="muted">{activeRubric.rubric_json.description}</div>
              </div>
              <div>
                <strong>Weights</strong>
                <div className="muted">
                  Fit {activeRubric.rubric_json.weights.fit} · Impact {activeRubric.rubric_json.weights.impact} · Contact {activeRubric.rubric_json.weights.contactability}
                </div>
              </div>
              <div>
                <strong>Thresholds</strong>
                <div className="muted">
                  High {activeRubric.rubric_json.thresholds.auto_high_priority} · Review {activeRubric.rubric_json.thresholds.editor_review} · Low {activeRubric.rubric_json.thresholds.low_priority}
                </div>
              </div>
              <div>
                <strong>Activated</strong>
                <div className="muted">{formatDateTime(activeRubric.activated_at || activeRubric.created_at)}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">
              <h2>Create a new draft</h2>
              <span className="muted">Guided mode for common edits, raw mode for power users.</span>
            </div>

            <form action={saveRubricDraftAction} className="stack">
              <input type="hidden" name="base_rubric_id" value={activeRubric.id} />

              <div className="filters">
                <label>
                  New version name
                  <input name="version_name" defaultValue={`${activeRubric.version_name}-draft`} required />
                </label>
                <label>
                  Description
                  <input name="description" defaultValue={fields.description} />
                </label>
              </div>

              <label>
                Draft notes
                <textarea name="notes" placeholder="Why are you changing this rubric?" />
              </label>

              <div className="filters">
                <label>
                  Editor mode
                  <select name="editor_mode" defaultValue="guided">
                    <option value="guided">Guided form</option>
                    <option value="raw">Raw JSON</option>
                  </select>
                </label>
                <label>
                  Rubric JSON version label
                  <input name="rubric_version" defaultValue={fields.rubric_version} />
                </label>
                <div />
                <div />
              </div>

              <div className="card" style={{ boxShadow: "none" }}>
                <h3>Top-level weights</h3>
                <div className="filters">
                  <label>
                    Fit weight
                    <input name="weights_fit" defaultValue={fields.weights_fit} />
                  </label>
                  <label>
                    Impact weight
                    <input name="weights_impact" defaultValue={fields.weights_impact} />
                  </label>
                  <label>
                    Contactability weight
                    <input name="weights_contactability" defaultValue={fields.weights_contactability} />
                  </label>
                </div>
              </div>

              <div className="card" style={{ boxShadow: "none" }}>
                <h3>Thresholds</h3>
                <div className="filters">
                  <label>
                    High priority threshold
                    <input name="threshold_high" defaultValue={fields.threshold_high} />
                  </label>
                  <label>
                    Editor review threshold
                    <input name="threshold_review" defaultValue={fields.threshold_review} />
                  </label>
                  <label>
                    Low priority threshold
                    <input name="threshold_low" defaultValue={fields.threshold_low} />
                  </label>
                </div>
              </div>

              <div className="card" style={{ boxShadow: "none" }}>
                <h3>Scoring tables</h3>
                <div className="stack">
                  <label>
                    Topic weights (one per line, <code>key = points</code>)
                    <textarea name="fit_topic_weights" defaultValue={fields.fit_topic_weights} />
                  </label>
                  <label>
                    Methodology weights (one per line, <code>key = points</code>)
                    <textarea name="fit_methodology_weights" defaultValue={fields.fit_methodology_weights} />
                  </label>
                  <label>
                    Fit penalties (one per line, <code>key = points</code>)
                    <textarea name="fit_penalties" defaultValue={fields.fit_penalties} />
                  </label>
                  <label>
                    Keyword boosts (one per line, <code>pattern | points</code>)
                    <textarea name="fit_keyword_boosts" defaultValue={fields.fit_keyword_boosts} />
                  </label>
                  <label>
                    Keyword penalties (one per line, <code>pattern | points</code>)
                    <textarea name="fit_keyword_penalties" defaultValue={fields.fit_keyword_penalties} />
                  </label>
                  <label>
                    Impact signals
                    <textarea name="impact_signals" defaultValue={fields.impact_signals} />
                  </label>
                  <label>
                    Impact caps
                    <textarea name="impact_caps" defaultValue={fields.impact_caps} />
                  </label>
                  <label>
                    Contact signals
                    <textarea name="contact_signals" defaultValue={fields.contact_signals} />
                  </label>
                  <label>
                    Contact penalties
                    <textarea name="contact_penalties" defaultValue={fields.contact_penalties} />
                  </label>
                  <label>
                    Topic taxonomy (one label per line)
                    <textarea name="topic_taxonomy" defaultValue={fields.topic_taxonomy} />
                  </label>
                </div>
              </div>

              <div className="card" style={{ boxShadow: "none" }}>
                <h3>Hard filters and explanations</h3>
                <div className="stack">
                  <label>
                    Hard filters JSON
                    <textarea name="hard_filters_json" defaultValue={fields.hard_filters_json} />
                  </label>
                  <label>
                    High-priority explanation template
                    <textarea name="template_high" defaultValue={fields.template_high} />
                  </label>
                  <label>
                    Review explanation template
                    <textarea name="template_review" defaultValue={fields.template_review} />
                  </label>
                  <label>
                    Low-priority explanation template
                    <textarea name="template_low" defaultValue={fields.template_low} />
                  </label>
                </div>
              </div>

              <div className="card" style={{ boxShadow: "none" }}>
                <h3>Advanced raw JSON override</h3>
                <label>
                  Raw rubric JSON
                  <textarea name="raw_json" defaultValue={fields.raw_json} />
                </label>
              </div>

              <button className="primary" type="submit">
                Save draft and preview
              </button>
            </form>
          </div>

          {preview ? (
            <div className="card">
              <div className="section-title">
                <h2>Draft preview</h2>
                <form action={activateRubricAction}>
                  <input type="hidden" name="rubric_id" value={preview.previewRubric.id} />
                  <button className="primary" type="submit">
                    Activate this draft
                  </button>
                </form>
              </div>
              <p className="muted">
                Comparing the active rubric against <strong>{preview.previewRubric.version_name}</strong> on the most recent papers.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Paper</th>
                      <th>Active</th>
                      <th>Draft</th>
                      <th>Delta</th>
                      <th>Preview band</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.comparisons.map((row: any) => (
                      <tr key={row.paper_id}>
                        <td>
                          <div className="paper-title">{row.title}</div>
                          <div className="muted">{row.source_server} · {row.posted_date}</div>
                          <div className="muted">{row.topics || "No topics"}</div>
                        </td>
                        <td>{row.active_score.toFixed(1)}</td>
                        <td>{row.preview_score.toFixed(1)}</td>
                        <td>{row.delta.toFixed(1)}</td>
                        <td>{row.preview_band}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div className="stack">
          <div className="card">
            <h2>Rubric versions</h2>
            <div className="stack">
              {versions.map((version) => (
                <div key={version.id} className="card" style={{ boxShadow: "none" }}>
                  <div className="section-title">
                    <strong>{version.version_name}</strong>
                    <span className="muted">{version.status}</span>
                  </div>
                  <div className="muted">Created {formatDateTime(version.created_at)}</div>
                  <div className="muted">{version.notes || "No notes"}</div>
                  {version.status !== "active" ? (
                    <div style={{ marginTop: 12 }}>
                      <a className="secondary-link" href={`/admin/rubric?preview=${version.id}`}>
                        Preview
                      </a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Editing tips</h2>
            <ul>
              <li>Keep the three top-level weights summing to roughly 1.0.</li>
              <li>Use the preview before activation to see what rises or falls.</li>
              <li>Make version names descriptive, for example <code>ldh-global-health-v2</code>.</li>
              <li>Keyword rules should stay short and specific to avoid false positives.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
