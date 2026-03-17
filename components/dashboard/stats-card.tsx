import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatsCardProps = {
  label: string;
  value: number;
  hint: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
        </div>
        <div className="rounded-2xl bg-ink/5 p-2 text-ink">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">{hint}</p>
    </Card>
  );
}
