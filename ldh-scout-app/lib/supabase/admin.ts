import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRoleConfig } from "@/lib/env";

let cachedAdminClient: any;

export function createAdminClient() {
  if (!hasServiceRoleConfig()) {
    throw new Error("Supabase service role configuration is missing");
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(env.supabaseUrl, env.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedAdminClient;
}
