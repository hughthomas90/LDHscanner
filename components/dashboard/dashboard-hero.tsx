import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DashboardHero() {
  return (
    <Card className="overflow-hidden bg-ink p-0 text-white">
      <div className="grid gap-6 p-8 lg:grid-cols-[1.3fr,0.7fr] lg:p-10">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/55">High-sensitivity scouting</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight">
            A single queue for digital health preprints, clinical trials, and later grants.
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-white/74">
            This first MVP focuses on broad capture, transparent rule-based scoring, and simple editorial triage.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-white text-ink hover:bg-white/90" href="/items">
              Open the review queue
            </Button>
            <Link className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold" href="/watchlists">
              Manage watchlists
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white/60">What this MVP already supports</p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>Magic-link sign-in for editors</li>
            <li>Supabase-backed items table with seeded examples</li>
            <li>Dashboard summary cards and quick filters</li>
            <li>Schema ready for snapshots, watchlists, and ingest runs</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
