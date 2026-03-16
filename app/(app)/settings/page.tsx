import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Settings</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Phase 4 will add digest thresholds, delivery email addresses, and configurable score cut-offs.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-mist p-5">
            <h2 className="text-lg font-semibold text-ink">Current defaults</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Fit high-priority threshold: 70</li>
              <li>Solicitation high-priority threshold: 65</li>
              <li>Digest schedule: daily at 07:00 Europe/London</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-mist p-5">
            <h2 className="text-lg font-semibold text-ink">Planned controls</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Email recipients and sender name</li>
              <li>Digest source toggles</li>
              <li>Inclusion and exclusion watchlist thresholds</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
