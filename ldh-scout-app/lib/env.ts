function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabasePublishableKey: getSupabasePublishableKey(),
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  cronSecret: process.env.CRON_SECRET || "",
  appBaseUrl: process.env.APP_BASE_URL || "",
  allowedEmailDomain: (process.env.ALLOWED_EMAIL_DOMAIN || "").toLowerCase().replace(/^@/, ""),
  preprintLookbackDays: Number(process.env.PREPRINT_LOOKBACK_DAYS || 2),
  dailyDigestLimit: Number(process.env.DAILY_DIGEST_LIMIT || 15),
  weeklyDigestLimit: Number(process.env.WEEKLY_DIGEST_LIMIT || 40),
};

export function hasSupabasePublicConfig() {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function hasServiceRoleConfig() {
  return Boolean(hasSupabasePublicConfig() && env.serviceRoleKey);
}

export function isAppConfigured() {
  return hasServiceRoleConfig();
}

export function assertEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
