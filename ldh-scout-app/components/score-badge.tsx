export default function ScoreBadge({
  value,
  band,
}: {
  value: number | string;
  band?: "high" | "review" | "low" | null;
}) {
  const label = typeof value === "number" ? value.toFixed(1) : String(value);

  return (
    <span className={`score-badge ${band || "neutral"}`}>
      {label}
    </span>
  );
}
