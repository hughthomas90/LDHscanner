import { NextResponse } from "next/server";
import { isAppConfigured } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isAppConfigured(),
    timestamp: new Date().toISOString(),
  });
}
