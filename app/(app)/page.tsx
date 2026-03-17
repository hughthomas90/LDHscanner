import Link from "next/link";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PreprintsTable } from "@/components/preprints/preprints-table";
import { getDashboardStats, getPreprints, getSelectedPreprintIds } from "@/lib/data";

export default async function DashboardPage() {
  const [stats, preprints, selectedIds] = await Promise.all([
    getDashboardStats(),
    getPreprints({ minFit: 60, minSolicitation: 50 }),
    getSelectedPreprintIds()
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
            <Link className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" href="/preprints">
              New preprints
            </Link>
            <Link className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" href="/trials">
              Changed trials
            </Link>
            <Link className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" href="/preprints?editorialStatus=watching">
              Watching preprints
            </Link>
            <Link
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
              href="/trials?editorialStatus=contact_soon"
            >
              Trials to contact
            </Link>
          </div>
        </div>
      </Card>

      <PreprintsTable
        items={preprints.slice(0, 6)}
        selectedIds={selectedIds.filter((id) => preprints.slice(0, 6).some((item) => item.id === id))}
        title="Priority preprints"
      />
    </>
  );
}
