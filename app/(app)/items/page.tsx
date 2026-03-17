import Link from "next/link";
import { Card } from "@/components/ui/card";

type ItemsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  await searchParams;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Streams</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Editorial streams</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Preprints and clinical trials now run as separate queues so each workflow can be triaged independently.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Preprints</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Triage and corresponding-author outreach</h2>
          <p className="mt-3 text-sm text-slate-600">
            Use the dedicated preprint stream to rank candidates by score, inspect reason flags, and email the corresponding author.
          </p>
          <Link className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white" href="/preprints">
            Open preprint stream
          </Link>
        </Card>
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Clinical trials</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Completion tracking and PI follow-up</h2>
          <p className="mt-3 text-sm text-slate-600">
            Use the trial stream to filter by completion timing, enrollment size, score, and principal-investigator details.
          </p>
          <Link className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white" href="/trials">
            Open trial stream
          </Link>
        </Card>
      </div>
    </section>
  );
}
