"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, FileSearch, FlaskConical, LayoutDashboard, Radar, Settings, Target } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/preprints", label: "Preprints", icon: FileSearch },
  { href: "/trials", label: "Trials", icon: FlaskConical },
  { href: "/watchlists", label: "Watchlists", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings }
];

type AppShellProps = {
  children: ReactNode;
  userEmail: string;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px,1fr] lg:px-6">
        <aside className="rounded-[32px] border border-white/70 bg-ink px-5 py-6 text-white shadow-panel">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">The Lancet Digital Health</p>
              <h1 className="text-xl font-semibold">Editorial Radar</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    isActive ? "bg-white text-ink" : "text-white/78 hover:bg-white/10 hover:text-white"
                  )}
                  href={href}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl bg-white/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4" />
              Daily digest
            </div>
            <p className="mt-2 text-sm text-white/70">
              Digest thresholds and delivery settings come in Phase 4. This shell already reserves the space.
            </p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 text-sm text-white/70">
            Signed in as
            <div className="mt-1 truncate font-medium text-white">{userEmail}</div>
            <button
              className="mt-4 rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
