"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { togglePreprintSelection } from "@/app/(app)/preprints/actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PreprintRow } from "@/lib/types";
import { formatDate, formatScore } from "@/lib/utils";

type PreprintsTableProps = {
  items: PreprintRow[];
  selectedIds?: string[];
  title?: string;
};

export function PreprintsTable({
  items,
  selectedIds: initialSelectedIds = [],
  title = "Preprint triage queue"
}: PreprintsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isPending, startTransition] = useTransition();

  function toggleSelection(itemId: string) {
    const previousSelectedIds = selectedIds;
    const isSelected = selectedIds.includes(itemId);
    const nextSelectedIds = isSelected
      ? selectedIds.filter((id) => id !== itemId)
      : [...selectedIds, itemId];

    setSelectedIds(nextSelectedIds);

    startTransition(async () => {
      try {
        await togglePreprintSelection(itemId, !isSelected);
        router.refresh();
      } catch {
        setSelectedIds(previousSelectedIds);
      }
    });
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ranked for editorial triage using fit, solicitation potential, and matched reason flags.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-ink">{selectedIds.length}</span> selected for editor follow-up
          {isPending ? <span className="ml-2 text-slate-500">Saving...</span> : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80 text-left text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Select</th>
              <th className="px-6 py-3 font-medium">Preprint</th>
              <th className="px-6 py-3 font-medium">Source</th>
              <th className="px-6 py-3 font-medium">Scores</th>
              <th className="px-6 py-3 font-medium">Reason flags</th>
              <th className="px-6 py-3 font-medium">Corresponding author</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr className="align-top" key={item.id}>
                <td className="px-6 py-4">
                  <input
                    checked={selectedIds.includes(item.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-ink focus:ring-ink"
                    disabled={isPending}
                    onChange={() => toggleSelection(item.id)}
                    type="checkbox"
                  />
                </td>
                <td className="px-6 py-4">
                  <Link className="font-semibold text-ink hover:text-accent" href={`/items/${item.id}`}>
                    {item.title}
                  </Link>
                  <p className="mt-1 line-clamp-3 max-w-2xl text-slate-600">
                    {item.abstract_text ?? "No abstract available yet."}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Published {formatDate(item.published_date)}
                  </p>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="font-medium text-ink">{item.source_name}</div>
                  <div>{item.source_id}</div>
                  <div className="mt-3">
                    <Badge label={item.editorial_status} />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div>
                    Fit: <span className="font-semibold text-ink">{formatScore(item.fit_score)}</span>
                  </div>
                  <div className="mt-2">
                    Solicit: <span className="font-semibold text-ink">{formatScore(item.solicitation_score)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex max-w-sm flex-wrap gap-2">
                    {Array.isArray(item.reason_flags) && item.reason_flags.length ? (
                      item.reason_flags.map((flag) => (
                        <span
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                          key={String(flag)}
                        >
                          {String(flag)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">No flags yet</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="font-medium text-ink">{item.corresponding_author_name ?? "Unknown"}</div>
                  <div className="mt-1 break-all text-slate-600">
                    {item.corresponding_author_email ?? "No email extracted"}
                  </div>
                  {item.corresponding_author_email ? (
                    <a
                      className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      href={`mailto:${item.corresponding_author_email}`}
                    >
                      Email author
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
