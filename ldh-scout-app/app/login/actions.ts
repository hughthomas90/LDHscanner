'use server';

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env, hasSupabasePublicConfig } from "@/lib/env";

export async function requestMagicLink(formData: FormData) {
  if (!hasSupabasePublicConfig()) {
    redirect("/login?error=config");
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    redirect("/login?error=email");
  }

  if (env.allowedEmailDomain && !email.endsWith(`@${env.allowedEmailDomain}`)) {
    redirect("/login?error=domain");
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.appBaseUrl || ""}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?sent=1");
}
