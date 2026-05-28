"use server";

import { createClient } from "@/lib/supabase/server";

export async function handleFeedbackSubmission(formData: FormData, turnstileToken: string) {
  const doing = formData.get("doing") as string;
  const wrong = formData.get("wrong") as string;
  const email = formData.get("email") as string;
  const pagePath = formData.get("page_path") as string; // Read current route location

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("citizen_feedback").insert(
      [
        {
          what_were_you_doing: doing,
          what_went_wrong: wrong,
          email_address: email || null,
          page_path: pagePath, // Map to column row
        },
      ],
      {
        captchaToken: turnstileToken,
      } as any
    );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: "An unexpected connection error occurred." };
  }
}
