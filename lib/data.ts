import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardStats, ItemRow } from "@/lib/types";

export type ItemFilters = {
  q?: string;
  sourceType?: string;
  editorialStatus?: string;
  minFit?: number;
  minSolicitation?: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: newToday }, { count: changedTrials }, { count: highPriority }, { count: watching }] =
    await Promise.all([
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .gte("first_seen_at", `${today}T00:00:00.000Z`),
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("source_type", "trial")
        .gte("updated_at", yesterday),
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .gte("fit_score", 70)
        .gte("solicitation_score", 65),
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("editorial_status", "watching")
    ]);

  return {
    newToday: newToday ?? 0,
    changedTrials: changedTrials ?? 0,
    highPriority: highPriority ?? 0,
    watching: watching ?? 0
  };
}

export async function getItems(filters: ItemFilters = {}): Promise<ItemRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("items")
    .select("*")
    .order("solicitation_score", { ascending: false })
    .order("fit_score", { ascending: false })
    .limit(100);

  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,abstract_text.ilike.%${filters.q}%`);
  }

  if (filters.sourceType && filters.sourceType !== "all") {
    query = query.eq("source_type", filters.sourceType);
  }

  if (filters.editorialStatus && filters.editorialStatus !== "all") {
    query = query.eq("editorial_status", filters.editorialStatus);
  }

  if (typeof filters.minFit === "number" && !Number.isNaN(filters.minFit)) {
    query = query.gte("fit_score", filters.minFit);
  }

  if (typeof filters.minSolicitation === "number" && !Number.isNaN(filters.minSolicitation)) {
    query = query.gte("solicitation_score", filters.minSolicitation);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ItemRow[];
}

export async function getItemById(id: string): Promise<ItemRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ItemRow | null;
}

export async function getItemSnapshots(itemId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("item_snapshots")
    .select("*")
    .eq("item_id", itemId)
    .order("snapshot_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getWatchlists() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("is_active", true)
    .order("list_type")
    .order("label");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
