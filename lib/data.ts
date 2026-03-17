import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  ItemRow,
  ItemSnapshotRow,
  PreprintRow,
  TrialRow,
  TrialWithSnapshot
} from "@/lib/types";

export type PreprintFilters = {
  q?: string;
  editorialStatus?: string;
  minFit?: number;
  minSolicitation?: number;
};

export type TrialFilters = {
  q?: string;
  editorialStatus?: string;
  minFit?: number;
  minSolicitation?: number;
  maxDaysUntilPrimaryCompletion?: number;
  maxDaysUntilCompletion?: number;
  minEnrollment?: number;
};

function isValidNumber(value: number | undefined) {
  return typeof value === "number" && !Number.isNaN(value);
}

function daysUntil(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  const now = new Date();
  const target = new Date(dateValue);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.ceil((target.getTime() - now.getTime()) / millisecondsPerDay);
}

async function getLatestSnapshots(itemIds: string[]) {
  if (!itemIds.length) {
    return new Map<string, ItemSnapshotRow>();
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("item_snapshots")
    .select("*")
    .in("item_id", itemIds)
    .order("snapshot_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const snapshots = new Map<string, ItemSnapshotRow>();

  for (const snapshot of (data ?? []) as ItemSnapshotRow[]) {
    if (!snapshots.has(snapshot.item_id)) {
      snapshots.set(snapshot.item_id, snapshot);
    }
  }

  return snapshots;
}

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

export async function getPreprints(filters: PreprintFilters = {}): Promise<PreprintRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("items")
    .select("*")
    .eq("source_type", "preprint")
    .order("solicitation_score", { ascending: false })
    .order("fit_score", { ascending: false })
    .limit(100);

  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,abstract_text.ilike.%${filters.q}%`);
  }

  if (filters.editorialStatus && filters.editorialStatus !== "all") {
    query = query.eq("editorial_status", filters.editorialStatus);
  }

  if (isValidNumber(filters.minFit)) {
    query = query.gte("fit_score", filters.minFit);
  }

  if (isValidNumber(filters.minSolicitation)) {
    query = query.gte("solicitation_score", filters.minSolicitation);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PreprintRow[];
}

export async function getTrials(filters: TrialFilters = {}): Promise<TrialWithSnapshot[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("items")
    .select("*")
    .eq("source_type", "trial")
    .order("solicitation_score", { ascending: false })
    .order("fit_score", { ascending: false })
    .limit(100);

  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,abstract_text.ilike.%${filters.q}%`);
  }

  if (filters.editorialStatus && filters.editorialStatus !== "all") {
    query = query.eq("editorial_status", filters.editorialStatus);
  }

  if (isValidNumber(filters.minFit)) {
    query = query.gte("fit_score", filters.minFit);
  }

  if (isValidNumber(filters.minSolicitation)) {
    query = query.gte("solicitation_score", filters.minSolicitation);
  }

  if (isValidNumber(filters.minEnrollment)) {
    query = query.gte("trial_enrollment", filters.minEnrollment);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const trials = (data ?? []) as TrialRow[];
  const latestSnapshots = await getLatestSnapshots(trials.map((trial) => trial.id));

  return trials
    .map((trial) => {
      const latestSnapshot = latestSnapshots.get(trial.id) ?? null;
      const daysUntilPrimaryCompletion = daysUntil(latestSnapshot?.primary_completion_date ?? null);
      const daysUntilCompletion = daysUntil(latestSnapshot?.completion_date ?? null);

      return {
        ...trial,
        latest_snapshot: latestSnapshot,
        days_until_primary_completion: daysUntilPrimaryCompletion,
        days_until_completion: daysUntilCompletion
      };
    })
    .filter((trial) => {
      const primaryCompletionLimit: number | null =
        typeof filters.maxDaysUntilPrimaryCompletion === "number" &&
        !Number.isNaN(filters.maxDaysUntilPrimaryCompletion)
          ? filters.maxDaysUntilPrimaryCompletion
          : null;
      const completionLimit: number | null =
        typeof filters.maxDaysUntilCompletion === "number" && !Number.isNaN(filters.maxDaysUntilCompletion)
          ? filters.maxDaysUntilCompletion
          : null;

      if (
        primaryCompletionLimit !== null &&
        (trial.days_until_primary_completion === null ||
          trial.days_until_primary_completion > primaryCompletionLimit)
      ) {
        return false;
      }

      if (
        completionLimit !== null &&
        (trial.days_until_completion === null || trial.days_until_completion > completionLimit)
      ) {
        return false;
      }

      return true;
    });
}

export async function getItems() {
  const [preprints, trials] = await Promise.all([
    getPreprints({ minFit: 60, minSolicitation: 50 }),
    getTrials({ minFit: 60, minSolicitation: 50 })
  ]);

  return [...preprints, ...trials].sort((left, right) => {
    if (right.solicitation_score !== left.solicitation_score) {
      return right.solicitation_score - left.solicitation_score;
    }

    return right.fit_score - left.fit_score;
  }) as ItemRow[];
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

  return (data ?? []) as ItemSnapshotRow[];
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

export async function getSelectedPreprintIds() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("preprint_selections")
    .select("preprint_id")
    .eq("editor_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((selection) => selection.preprint_id as string);
}
