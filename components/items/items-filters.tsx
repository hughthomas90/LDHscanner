import { Search } from "lucide-react";

type ItemsFiltersProps = {
  searchParams: Record<string, string | undefined>;
};

export function ItemsFilters({ searchParams }: ItemsFiltersProps) {
  return (
    <form className="grid gap-3 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-panel lg:grid-cols-5">
      <label className="relative block lg:col-span-2">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm"
          defaultValue={searchParams.q ?? ""}
          name="q"
          placeholder="Search title or abstract"
        />
      </label>

      <select
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
        defaultValue={searchParams.sourceType ?? "all"}
        name="sourceType"
      >
        <option value="all">All sources</option>
        <option value="preprint">Preprints</option>
        <option value="trial">Clinical trials</option>
        <option value="grant">Grants</option>
      </select>

      <select
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
        defaultValue={searchParams.editorialStatus ?? "all"}
        name="editorialStatus"
      >
        <option value="all">All editorial states</option>
        <option value="new">New</option>
        <option value="watching">Watching</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="contact_soon">Contact soon</option>
        <option value="contacted">Contacted</option>
        <option value="ignored">Ignored</option>
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          defaultValue={searchParams.minFit ?? ""}
          min="0"
          name="minFit"
          placeholder="Min fit"
          type="number"
        />
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          defaultValue={searchParams.minSolicitation ?? ""}
          min="0"
          name="minSolicitation"
          placeholder="Min solicit"
          type="number"
        />
      </div>

      <button
        className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 lg:col-start-5"
        type="submit"
      >
        Apply filters
      </button>
    </form>
  );
}
