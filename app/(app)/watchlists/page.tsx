import { Card } from "@/components/ui/card";
import { getWatchlists } from "@/lib/data";

export default async function WatchlistsPage() {
  const watchlists = await getWatchlists();

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Watchlists</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Watchlist management</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          This first pass is read-only so you can confirm the structure. Editing comes in the next phase.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {watchlists.map((watchlist) => (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5" key={watchlist.id}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{watchlist.list_type}</p>
              <h2 className="mt-2 text-lg font-semibold text-ink">{watchlist.label}</h2>
              <p className="mt-2 text-sm text-slate-600">{watchlist.normalized_value}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
