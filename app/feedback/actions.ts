"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * ACTION 1: Handles specific page-context bug and problem logs
 * Used by: components/govuk/ReportProblem.tsx
 */
export async function handleFeedbackSubmission(formData: FormData, turnstileToken: string) {
  const doing = formData.get("doing") as string;
  const wrong = formData.get("wrong") as string;
  const email = formData.get("email") as string;
  const pagePath = formData.get("page_path") as string;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Server configuration missing context credentials." };
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabaseAdmin.from("citizen_feedback").insert([
      {
        what_were_you_doing: doing,
        what_went_wrong: wrong,
        email_address: email || null,
        page_path: pagePath || "/unknown",
      }
    ]);

    if (error) return { success: false, error: `Supabase Error: ${error.message}` };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Server Exception: ${err.message || err}` };
  }
}

/**
 * ACTION 2: Handles overall system improvements from the beta header link
 * Used by: app/feedback/page.tsx
 */
export async function handleGeneralFeedback(formData: FormData, turnstileToken: string) {
  const feedbackText = formData.get("feedback_text") as string;
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Server configuration missing context credentials." };
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
