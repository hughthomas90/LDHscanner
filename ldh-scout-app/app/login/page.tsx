import Link from "next/link";
import { requestMagicLink } from "./actions";
import { env, hasSupabasePublicConfig } from "@/lib/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function messageForError(error?: string) {
  if (!error) {
    return "";
  }
  if (error === "domain") {
    return `Use your ${env.allowedEmailDomain || "approved"} email address.`;
  }
  if (error === "config") {
    return "Supabase authentication is not configured yet.";
  }
  if (error === "email") {
    return "Enter an email address to continue.";
  }
  return decodeURIComponent(error);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const sent = params.sent === "1";

  return (
    <main>
      <div className="page-header">
        <div>
          <div className="kicker">Sign in</div>
          <h1>Access LDH Scout</h1>
          <p>
            Passwordless sign-in keeps the setup lightweight for an internal editorial workflow.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {!hasSupabasePublicConfig() ? (
          <div className="callout">
            Add the Supabase URL and publishable key in Vercel before using login.
          </div>
        ) : null}

        {error ? <div className="notice">{messageForError(error)}</div> : null}
        {sent ? (
          <div className="notice">
            Magic link sent. Open the email on this same device and you will be signed in automatically.
          </div>
        ) : null}

        <form action={requestMagicLink} className="stack">
          <label>
            Work email
            <input name="email" type="email" placeholder="you@thelancet.com" required />
          </label>
          <button className="primary" type="submit">
            Send magic link
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16 }}>
          After the first sign-in, you can keep the app private inside Vercel and restrict access by
          domain in the environment variables.
        </p>

        <p className="muted">
          <Link className="secondary-link" href="/">
            Back to dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
