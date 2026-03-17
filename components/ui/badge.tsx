import { badgeTone, cn } from "@/lib/utils";

type BadgeProps = {
  label: string;
  tone?: string;
};

export function Badge({ label, tone }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tone ? tone : badgeTone(label)
      )}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}
