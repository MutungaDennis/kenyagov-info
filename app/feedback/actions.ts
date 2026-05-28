"use server";

import { createClient } from "@supabase/supabase-js";

export async function handleGeneralFeedback(formData: FormData, turnstileToken: string) {
  const feedbackText = formData.get("feedback_text") as string;
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Server configuration error: Missing connection credentials." };
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabaseAdmin.from("general_feedback").insert([
      {
        feedback_text: feedbackText,
        full_name: fullName || null,
        email_address: email || null,
      }
    ]);

    if (error) return { success: false, error: `Supabase Error: ${error.message}` };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Server Exception: ${err.message || err}` };
  }
}
