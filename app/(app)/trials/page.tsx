import { TrialsFilters } from "@/components/trials/trials-filters";
import { TrialsTable } from "@/components/trials/trials-table";
import { getTrials } from "@/lib/data";

type TrialsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function TrialsPage({ searchParams }: TrialsPageProps) {
  const params = await searchParams;
  const items = await getTrials({
    q: params.q,
    editorialStatus: params.editorialStatus,
    minFit: params.minFit ? Number(params.minFit) : undefined,
    minSolicitation: params.minSolicitation ? Number(params.minSolicitation) : undefined,
    maxDaysUntilPrimaryCompletion: params.maxDaysUntilPrimaryCompletion
      ? Number(params.maxDaysUntilPrimaryCompletion)
      : undefined,
    maxDaysUntilCompletion: params.maxDaysUntilCompletion
      ? Number(params.maxDaysUntilCompletion)
      : undefined,
    minEnrollment: params.minEnrollment ? Number(params.minEnrollment) : undefined
  });

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Clinical trial stream</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Trials</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Review trial features separately, then filter by primary completion timing, overall completion timing, enrollment size, and PI contact details.
        </p>
      </div>
      <TrialsFilters searchParams={params} />
      <TrialsTable items={items} />
    </section>
  );
}
