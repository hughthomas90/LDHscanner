import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runFetchWorkflow } from "@/lib/preprints/workflow";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (env.cronSecret && authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runFetchWorkflow();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
