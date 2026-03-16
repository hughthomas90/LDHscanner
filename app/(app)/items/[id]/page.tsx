import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getItemById, getItemSnapshots } from "@/lib/data";
import { formatDate, formatScore } from "@/lib/utils";

type ItemDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const [item, snapshots] = await Promise.all([getItemById(id), getItemSnapshots(id)]);

  if (!item) {
    notFound();
  }

  const reasonFlags = Array.isArray(item.reason_flags) ? item.reason_flags : [];
  const modalityTags = Array.isArray(item.modality_tags) ? item.modality_tags : [];
  const institutionHits = Array.isArray(item.institution_hits) ? item.institution_hits : [];

  return (
    <section className="space-y-4">
      <Link className="text-sm font-medium text-slate-500 hover:text-ink" href="/items">
        Back to items
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <Badge label={item.editorial_status} />
              <Badge label={item.source_type} tone="bg-slate-100 text-slate-700 ring-slate-200" />
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-ink">{item.title}</h1>
            <p className="mt-3 text-sm text-slate-600">
              {item.source_name} • Published {formatDate(item.published_date)} • Current status{" "}
              {item.current_status ?? "Unknown"}
            </p>
          </div>
          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fit</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{formatScore(item.fit_score)}</p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Solicit</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{formatScore(item.solicitation_score)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Abstract</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {item.abstract_text ?? "No abstract text stored yet."}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Reason flags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {reasonFlags.map((flag) => (
                  <span
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    key={String(flag)}
                  >
                    {String(flag)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-ink">Scoring breakdown</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Modality tags: {modalityTags.length ? modalityTags.join(", ") : "None yet"}</li>
                <li>Institution hits: {institutionHits.length ? institutionHits.join(", ") : "None yet"}</li>
                <li>Company hits: {Array.isArray(item.company_hits) ? item.company_hits.join(", ") : "None yet"}</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-ink">Change history</h2>
              <div className="mt-3 space-y-3">
                {snapshots.length ? (
                  snapshots.map((snapshot) => (
                    <div className="rounded-2xl bg-white p-3 text-sm text-slate-700" key={snapshot.id}>
                      <div className="font-medium text-ink">{formatDate(snapshot.snapshot_at)}</div>
                      <div>Status: {snapshot.status ?? "Unknown"}</div>
                      <div>Sponsor: {snapshot.sponsor_name ?? "Unknown"}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No snapshots yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
