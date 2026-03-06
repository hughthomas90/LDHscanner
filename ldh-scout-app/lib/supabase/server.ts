import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, hasSupabasePublicConfig } from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!hasSupabasePublicConfig()) {
    throw new Error("Supabase public configuration is missing");
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always mutate cookies; Route Handlers and Proxy cover that case.
        }
      },
    },
  });
}
