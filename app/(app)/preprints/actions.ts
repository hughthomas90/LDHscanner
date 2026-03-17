"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function togglePreprintSelection(preprintId: string, shouldSelect: boolean) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  if (shouldSelect) {
    const { error } = await supabase.from("preprint_selections").upsert({
      preprint_id: preprintId,
      editor_id: user.id
    });

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("preprint_selections")
      .delete()
      .eq("preprint_id", preprintId)
      .eq("editor_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/preprints");
  revalidatePath("/");
}
