export type Dict<T = unknown> = Record<string, T>;

export function clamp(value: number, min = 0, max = 100) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "—";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "—";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatScore(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return "—";
  }
  return numeric.toFixed(1);
}

export function truncate(text: string | null | undefined, length = 180) {
  if (!text) {
    return "";
  }
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length - 1).trimEnd()}…`;
}

export function coerceString(value: FormDataEntryValue | null | undefined) {
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

export function coerceNumber(value: FormDataEntryValue | null | undefined, fallback = 0) {
  const numeric = Number(coerceString(value));
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function coerceBoolean(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return false;
  }
  return ["true", "on", "1", "yes"].includes(value.toLowerCase());
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function stripTags(value: string) {
  return value
    .replace(/<\/*(?:italic|bold|sup|sub|sc)[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addUtcDays(date: Date, delta: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + delta);
  return copy;
}

export function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function unique<T>(items: T[]) {
  return [...new Set(items)];
}

export function ensureArray<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
}

export async function runPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = [];
  let currentIndex = 0;

  async function consume() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await worker(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, () =>
    consume(),
  );
  await Promise.all(workers);
  return results;
}

export function regexFromPattern(pattern: string) {
  try {
    return new RegExp(pattern, "i");
  } catch {
    return null;
  }
}

export function matchPattern(pattern: string, text: string) {
  const regex = regexFromPattern(pattern);
  return regex ? regex.test(text) : false;
}

export function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}
