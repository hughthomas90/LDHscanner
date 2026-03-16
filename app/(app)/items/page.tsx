import { ItemsFilters } from "@/components/items/items-filters";
import { ItemsTable } from "@/components/items/items-table";
import { getItems } from "@/lib/data";

type ItemsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const items = await getItems({
    q: params.q,
    sourceType: params.sourceType,
    editorialStatus: params.editorialStatus,
    minFit: params.minFit ? Number(params.minFit) : undefined,
    minSolicitation: params.minSolicitation ? Number(params.minSolicitation) : undefined
  });

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Review queue</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Items</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Filter broadly, then use the scores and reason flags to decide what deserves human attention first.
        </p>
      </div>
      <ItemsFilters searchParams={params} />
      <ItemsTable items={items} />
    </section>
  );
}
