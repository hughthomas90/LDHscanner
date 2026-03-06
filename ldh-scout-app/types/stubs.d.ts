declare module "next/link" {
  const Link: any;
  export default Link;
}

declare module "next/navigation" {
  export const redirect: any;
  export const notFound: any;
}

declare module "next/server" {
  export const NextResponse: any;
  export type NextRequest = any;
}

declare module "next/headers" {
  export const cookies: any;
  export const headers: any;
}

declare module "@supabase/ssr" {
  export const createBrowserClient: any;
  export const createServerClient: any;
}

declare module "@supabase/supabase-js" {
  export type EmailOtpType = any;
  export const createClient: any;
}

declare namespace React {
  type ReactNode = any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}


declare module "next" {
  export type NextConfig = any;
}

declare const process: {
  env: Record<string, string | undefined>;
};
