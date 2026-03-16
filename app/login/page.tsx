import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 lg:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-[36px] bg-ink p-8 text-white shadow-panel lg:p-12">
          <p className="text-sm uppercase tracking-[0.28em] text-white/60">Internal editorial intelligence</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight">
            Spot promising digital health papers and trials before everyone else does.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/74">
            Editorial Radar is a high-sensitivity triage queue for preprints, clinical trials, and later grants.
          </p>
        </section>

        <Card className="mx-auto w-full max-w-xl self-center p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Sign in</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Editorial team access</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use your invited email address. Supabase will send a secure magic link.
            </p>
          </div>
          <div className="mt-6">
            <LoginForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
