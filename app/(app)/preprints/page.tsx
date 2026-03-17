import { PreprintsFilters } from "@/components/preprints/preprints-filters";
import { PreprintsTable } from "@/components/preprints/preprints-table";
import { getPreprints, getSelectedPreprintIds } from "@/lib/data";

type PreprintsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreprintsPage({ searchParams }: PreprintsPageProps) {
  const params = await searchParams;
  const [items, selectedIds] = await Promise.all([
    getPreprints({
      q: params.q,
      editorialStatus: params.editorialStatus,
      minFit: params.minFit ? Number(params.minFit) : undefined,
      minSolicitation: params.minSolicitation ? Number(params.minSolicitation) : undefined
    }),
    getSelectedPreprintIds()
  ]);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Preprint stream</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Preprints</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Triage MedRxiv, arXiv, and other preprint detections separately using scores, flags, and corresponding-author contact details.
        </p>
      </div>
      <PreprintsFilters searchParams={params} />
      <PreprintsTable items={items} selectedIds={selectedIds} />
    </section>
  );
}
