import Link from "next/link";
import "./globals.css";
import { getOptionalUser } from "@/lib/auth";
import { isAppConfigured } from "@/lib/env";

export const metadata = {
  title: "LDH Scout",
  description: "Editorial preprint scouting for The Lancet Digital Health",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalUser();

  return (
    <html lang="en">
      <body>
        <div className="shell-nav">
          <div className="shell-nav-inner">
            <div className="nav-links">
              <Link className="brand" href="/">
                LDH Scout
              </Link>
              <Link className="nav-link" href="/">
                Dashboard
              </Link>
              <Link className="nav-link" href="/admin/rubric">
                Rubric
              </Link>
              <Link className="nav-link" href="/admin/digests">
                Digests
              </Link>
            </div>
            <div className="nav-links">
              {isAppConfigured() ? (
                user ? (
                  <>
                    <span className="muted">{user.email}</span>
                    <a className="nav-link" href="/auth/signout">
                      Sign out
                    </a>
                  </>
                ) : (
                  <Link className="nav-link" href="/login">
                    Sign in
                  </Link>
                )
              ) : (
                <span className="muted">Environment setup still needed</span>
              )}
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
