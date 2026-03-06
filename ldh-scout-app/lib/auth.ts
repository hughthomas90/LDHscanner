import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function emailAllowed(email?: string | null) {
  if (!env.allowedEmailDomain) {
    return true;
  }
  return Boolean(email?.toLowerCase().endsWith(`@${env.allowedEmailDomain}`));
}

export async function getOptionalUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getOptionalUser();

  if (!user) {
    redirect("/login");
  }

  if (!emailAllowed(user.email)) {
    redirect("/login?error=domain");
  }

  return user;
}
