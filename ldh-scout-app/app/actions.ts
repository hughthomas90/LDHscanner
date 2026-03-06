'use server';

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formDataToRubric } from "@/lib/scoring/rubric";
import { getActiveRubric, getRubricVersion } from "@/lib/data";
import { runFetchWorkflow } from "@/lib/preprints/workflow";
import { generateDigest } from "@/lib/digest";

export async function runFetchWorkflowAction() {
  await requireUser();
  await runFetchWorkflow();
  redirect("/?notice=fetched");
}

export async function generateDailyDigestAction() {
  await requireUser();
  await generateDigest("daily", new Date());
  redirect("/admin/digests?notice=daily");
}

export async function generateWeeklyDigestAction() {
  await requireUser();
  await generateDigest("weekly", new Date());
  redirect("/admin/digests?notice=weekly");
}

export async function saveRubricDraftAction(formData: FormData) {
  const user = await requireUser();
  const admin = createAdminClient();
  const baseRubricId = String(formData.get("base_rubric_id") || "");
  const versionName = String(formData.get("version_name") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const baseRubric = baseRubricId ? await getRubricVersion(baseRubricId) : await getActiveRubric();
  if (!baseRubric) {
    redirect("/admin/rubric?error=no-active-rubric");
  }

  const resolvedBaseRubric = baseRubric!;
  const parsedRubric = formDataToRubric(formData, resolvedBaseRubric.rubric_json);
  parsedRubric.status = "draft";
  parsedRubric.rubric_version = versionName || parsedRubric.rubric_version;

  const { data, error } = await admin
    .from("rubric_versions")
    .insert({
      version_name: versionName || parsedRubric.rubric_version,
      status: "draft",
      rubric_json: parsedRubric,
      notes,
      created_by: user.email,
    })
    .select()
    .single();

  if (error) {
    redirect(`/admin/rubric?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/rubric?preview=${data.id}&notice=saved`);
}

export async function activateRubricAction(formData: FormData) {
  const user = await requireUser();
  const admin = createAdminClient();
  const rubricId = String(formData.get("rubric_id") || "");

  if (!rubricId) {
    redirect("/admin/rubric?error=missing-rubric-id");
  }

  await admin.from("rubric_versions").update({ status: "archived" }).eq("status", "active");

  const { error } = await admin
    .from("rubric_versions")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
      created_by: user.email,
    })
    .eq("id", rubricId);

  if (error) {
    redirect(`/admin/rubric?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/rubric?notice=activated");
}
