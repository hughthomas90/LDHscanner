import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPaperDetail } from "@/lib/data";
import { formatDate, formatScore } from "@/lib/utils";
import { topicLabel } from "@/lib/scoring/topic-taxonomy";
import ScoreBadge from "@/components/score-badge";

type Params = Promise<{ id: string }>;

export default async function PaperDetailPage({ params }: { params: Params }) {
  await requireUser();
  const { id } = await params;

  try {
    const { paper, contacts, score } = await getPaperDetail(id);
    const explanation = score?.explanation_json || {};

    return (
      <main>
        <div className="page-header">
          <div>
            <div className="kicker">{paper.source_server}</div>
            <h1>{paper.title}</h1>
            <p>Posted {formatDate(paper.posted_date)} · Category {paper.category || "Uncategorised"}</p>
          </div>
          <div className="inline-links">
            {paper.fulltext_url ? (
              <a className="secondary-link" href={paper.fulltext_url} target="_blank" rel="noreferrer">
                Open preprint
              </a>
            ) : null}
            {paper.jats_xml_url ? (
              <a className="secondary-link" href={paper.jats_xml_url} target="_blank" rel="noreferrer">
                JATS XML
              </a>
            ) : null}
            {paper.published_url ? (
              <a className="secondary-link" href={paper.published_url} target="_blank" rel="noreferrer">
                Published version
              </a>
            ) : null}
            <Link className="secondary-link" href="/">
              Back
            </Link>
          </div>
        </div>

        <div className="two-column">
          <div className="stack">
            <div className="card">
              <h2>Abstract</h2>
              <p className="markdown">{paper.abstract || "No abstract available."}</p>
            </div>

            <div className="card">
              <h2>Topics</h2>
              <div className="topic-list">
                {(paper.normalized_topics || []).map((key: string) => (
                  <span className="topic-pill" key={key}>
                    {topicLabel(key)}
                  </span>
                ))}
                {!paper.normalized_topics?.length ? <span className="muted">No topics inferred yet.</span> : null}
              </div>
            </div>

            <div className="card">
              <h2>Contact details</h2>
              <div className="stack">
                {contacts.map((contact: any, index: number) => (
                  <div key={`${contact.contact_email || contact.contact_name || "contact"}-${index}`} className="card" style={{ boxShadow: "none" }}>
                    <strong>{contact.contact_name || "Unnamed contact"}</strong>
                    <div className="muted">{contact.contact_role}</div>
                    <div>{contact.contact_email || "No public email found"}</div>
                    <div className="muted">{contact.affiliation || "No affiliation available"}</div>
                    <div className="muted">
                      {contact.source_type} · confidence {contact.confidence}
                      {contact.orcid ? ` · ${contact.orcid}` : ""}
                    </div>
                  </div>
                ))}
                {!contacts.length ? <div className="muted">No contact details have been extracted for this paper yet.</div> : null}
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <h2>Current score</h2>
              {score ? (
                <>
                  <ScoreBadge value={score.priority_score} band={score.score_band} />
                  <div className="muted" style={{ marginTop: 12 }}>
                    Fit {formatScore(score.fit_score)} · Impact {formatScore(score.impact_score)} · Contact {formatScore(score.contactability_score)}
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    Penalties {formatScore(score.penalty_total)}
                  </div>
                  <p style={{ marginTop: 16 }}>{explanation.summary || "No summary available."}</p>
                </>
              ) : (
                <p className="muted">This paper has not been scored with the active rubric yet.</p>
              )}
            </div>

            <div className="card">
              <h2>Why it matched</h2>
              <div className="stack">
                <div>
                  <strong>Fit signals</strong>
                  <ul>
                    {(explanation.fit_reasons || []).map((reason: string) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Penalties</strong>
                  <ul>
                    {(explanation.fit_penalties || []).map((reason: string) => (
                      <li key={reason}>{reason}</li>
                    ))}
                    {!explanation.fit_penalties?.length ? <li>No penalties triggered.</li> : null}
                  </ul>
                </div>
                <div>
                  <strong>Impact signals</strong>
                  <ul>
                    {(explanation.impact_reasons || []).map((reason: string) => (
                      <li key={reason}>{reason}</li>
                    ))}
                    {!explanation.impact_reasons?.length ? <li>No strong impact signals were detected automatically.</li> : null}
                  </ul>
                </div>
                <div>
                  <strong>Hard filters</strong>
                  <ul>
                    {(explanation.hard_filters || []).map((reason: string) => (
                      <li key={reason}>{reason}</li>
                    ))}
                    {!explanation.hard_filters?.length ? <li>No hard filters triggered.</li> : null}
                  </ul>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Raw score explanation JSON</h2>
              <pre className="json">{JSON.stringify(explanation, null, 2)}</pre>
            </div>
          </div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
