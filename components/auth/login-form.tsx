"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Magic link sent. Open your email and click the sign-in link.");
    setLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
          Work email
        </label>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          id="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="editor@thelancet.com"
          required
          type="email"
          value={email}
        />
      </div>

      <Button className="w-full" type="submit">
        {loading ? "Sending..." : "Email me a sign-in link"}
      </Button>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
