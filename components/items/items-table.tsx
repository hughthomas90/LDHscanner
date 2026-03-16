import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ItemRow } from "@/lib/types";
import { formatDate, formatScore } from "@/lib/utils";

type ItemsTableProps = {
  items: ItemRow[];
  title?: string;
  compact?: boolean;
};

export function ItemsTable({ items, title = "Review queue", compact = false }: ItemsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ranked to favor high recall first, then editorial usefulness.
          </p>
        </div>
        <p className="text-sm text-slate-500">{items.length} items</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80 text-left text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Item</th>
              <th className="px-6 py-3 font-medium">Source</th>
              <th className="px-6 py-3 font-medium">Published</th>
              <th className="px-6 py-3 font-medium">Fit</th>
              <th className="px-6 py-3 font-medium">Solicit</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr className="align-top" key={item.id}>
                <td className="px-6 py-4">
                  <Link className="font-semibold text-ink hover:text-accent" href={`/items/${item.id}`}>
                    {item.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 max-w-2xl text-slate-600">
                    {item.abstract_text ?? "No abstract available yet."}
                  </p>
                  {!compact ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(item.reason_flags)
                        ? item.reason_flags.slice(0, 3).map((flag) => (
                            <span
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                              key={String(flag)}
                            >
                              {String(flag)}
                            </span>
                          ))
                        : null}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="font-medium text-ink">{item.source_name}</div>
                  <div className="capitalize">{item.source_type}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(item.published_date)}</td>
                <td className="px-6 py-4 font-semibold text-ink">{formatScore(item.fit_score)}</td>
                <td className="px-6 py-4 font-semibold text-ink">{formatScore(item.solicitation_score)}</td>
                <td className="px-6 py-4">
                  <Badge label={item.editorial_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
