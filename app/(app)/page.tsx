import Link from "next/link";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ItemsTable } from "@/components/items/items-table";
import { getDashboardStats, getItems } from "@/lib/data";

export default async function DashboardPage() {
  const [stats, items] = await Promise.all([
    getDashboardStats(),
    getItems({ minFit: 60, minSolicitation: 50 })
  ]);

  return (
    <>
      <DashboardHero />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard hint="Fresh items first seen since midnight." label="New today" value={stats.newToday} />
        <StatsCard
          hint="Trials updated in the last 24 hours."
          label="Changed trials"
          value={stats.changedTrials}
        />
        <StatsCard
          hint="Items clearing both high-priority thresholds."
          label="High priority"
          value={stats.highPriority}
        />
        <StatsCard hint="Items currently under active watch." label="Watching" value={stats.watching} />
      </section>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Quick filters</h2>
            <p className="mt-1 text-sm text-slate-600">Jump straight into the slices your team will check most often.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" href="/items?sourceType=preprint">
              New preprints
            </Link>
            <Link className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" href="/items?sourceType=trial">
              Changed trials
            </Link>
            <Link className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" href="/items?editorialStatus=watching">
              Watching
            </Link>
            <Link
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
              href="/items?editorialStatus=contact_soon"
            >
              Contact soon
            </Link>
          </div>
        </div>
      </Card>

      <ItemsTable items={items.slice(0, 12)} title="Priority queue" />
    </>
  );
}
