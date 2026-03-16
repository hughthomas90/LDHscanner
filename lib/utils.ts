import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatScore(score: number) {
  return Math.round(score);
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function badgeTone(status: string) {
  switch (status) {
    case "shortlisted":
      return "bg-signal/10 text-signal ring-signal/20";
    case "contact_soon":
      return "bg-accent/10 text-accent ring-accent/20";
    case "contacted":
      return "bg-ink/10 text-ink ring-ink/15";
    case "watching":
      return "bg-warn/10 text-warn ring-warn/20";
    case "ignored":
      return "bg-danger/10 text-danger ring-danger/20";
    default:
      return "bg-white text-slate-600 ring-slate-200";
  }
}
