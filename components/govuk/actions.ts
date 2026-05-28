"use server";

import { createClient } from "@/lib/supabase/server";

export async function recordPageVote(pagePath: string, isUseful: boolean) {
  try {
    const supabase = await createClient();

    // Directly insert into the analytical data schema via server client validation variables
    const { error } = await supabase.from("page_usefulness_votes").insert([
      {
        page_path: pagePath,
        is_useful: isUseful,
      },
    ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Database transaction failure." };
  }
}
