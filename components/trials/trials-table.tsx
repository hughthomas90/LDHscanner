import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TrialWithSnapshot } from "@/lib/types";
import { formatDate, formatRelativeDays, formatScore } from "@/lib/utils";

type TrialsTableProps = {
  items: TrialWithSnapshot[];
};

export function TrialsTable({ items }: TrialsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">Clinical trial radar</h2>
          <p className="mt-1 text-sm text-slate-600">
            Filter by completion timing, enrollment size, and outreach priority for trial follow-up.
          </p>
        </div>
        <p className="text-sm text-slate-500">{items.length} trials</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80 text-left text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Trial</th>
              <th className="px-6 py-3 font-medium">Status and dates</th>
              <th className="px-6 py-3 font-medium">Scale</th>
              <th className="px-6 py-3 font-medium">Scores</th>
              <th className="px-6 py-3 font-medium">Primary investigator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr className="align-top" key={item.id}>
                <td className="px-6 py-4">
                  <Link className="font-semibold text-ink hover:text-accent" href={`/items/${item.id}`}>
                    {item.title}
                  </Link>
                  <p className="mt-1 line-clamp-3 max-w-2xl text-slate-600">
                    {item.abstract_text ?? "No abstract available yet."}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge label={item.editorial_status} />
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.source_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="font-medium text-ink">{item.latest_snapshot?.status ?? item.current_status ?? "Unknown"}</div>
                  <div className="mt-2">Primary completion: {formatDate(item.latest_snapshot?.primary_completion_date ?? null)}</div>
                  <div className="text-slate-600">
                    Due in {formatRelativeDays(item.days_until_primary_completion)}
                  </div>
                  <div className="mt-2">Completion: {formatDate(item.latest_snapshot?.completion_date ?? null)}</div>
                  <div className="text-slate-600">Due in {formatRelativeDays(item.days_until_completion)}</div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div>Enrollment: <span className="font-semibold text-ink">{item.trial_enrollment ?? "Unknown"}</span></div>
                  <div className="mt-2">Sponsor: {item.latest_snapshot?.sponsor_name ?? "Unknown"}</div>
                  <div className="mt-2">Source: {item.source_name}</div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div>Fit: <span className="font-semibold text-ink">{formatScore(item.fit_score)}</span></div>
                  <div className="mt-2">
                    Solicit: <span className="font-semibold text-ink">{formatScore(item.solicitation_score)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="font-medium text-ink">{item.primary_investigator_name ?? "Unknown"}</div>
                  <div className="mt-1 break-all text-slate-600">
                    {item.primary_investigator_email ?? "No contact extracted"}
                  </div>
                  {item.primary_investigator_email ? (
                    <a
                      className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      href={`mailto:${item.primary_investigator_email}`}
                    >
                      Email PI
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
