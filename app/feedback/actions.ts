"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

/**
 * Verifies Cloudflare Turnstile token.
 * Never exposes configuration details to the user.
 */
async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("CONFIG ERROR: TURNSTILE_SECRET_KEY is missing");
    return false;
  }

  const headersList = await headers();
  const remoteIp =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";

  // Development / test key bypass
  const isDev = process.env.NODE_ENV === "development";
  const isTestKey = secretKey.includes("000000000000000000000000000000000000000");

  if (isDev || isTestKey) {
    return !!token && token.length > 8;
  }

  try {
    const payload = new URLSearchParams();
    payload.append("secret", secretKey);
    payload.append("response", token);
    if (remoteIp) payload.append("remoteip", remoteIp);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

/**
 * ACTION 1: Report a problem on a specific page
 * Used by: components/govuk/ReportProblem.tsx
 */
export async function handleFeedbackSubmission(formData: FormData, turnstileToken: string) {
  const isValid = await verifyTurnstileToken(turnstileToken);
  if (!isValid) {
    return { success: false, error: "We could not verify the security check. Please refresh the page and try again." };
  }

  const doing = formData.get("doing") as string;
  const wrong = formData.get("wrong") as string;
  const email = formData.get("email") as string;
  const pagePath = formData.get("page_path") as string;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("CONFIG ERROR: Supabase credentials missing");
    return { success: false, error: "We are currently unable to save feedback. Please try again later." };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("citizen_feedback")
      .insert([
        {
          what_were_you_doing: doing,
          what_went_wrong: wrong,
          email_address: email || null,
          page_path: pagePath || "/unknown",
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Database error (citizen_feedback):", error);
      return { success: false, error: "We could not save your feedback right now. Please try again later." };
    }

    return { success: true, recordId: data.id };
  } catch (err: any) {
    console.error("Unexpected error in handleFeedbackSubmission:", err);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}

/**
 * ACTION 2: General feedback from /feedback page
 * Used by: app/feedback/page.tsx
 */
export async function handleGeneralFeedback(formData: FormData, turnstileToken: string) {
  const isValid = await verifyTurnstileToken(turnstileToken);
  if (!isValid) {
    return { success: false, error: "We could not verify the security check. Please refresh the page and try again." };
  }

  const feedbackText = (formData.get("feedback_text") as string) || "";
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;

  // Validation
  if (!feedbackText.trim()) {
    return { success: false, error: "Enter your feedback on how we can improve this website." };
  }

  if (feedbackText.length > 1200) {
    const excess = feedbackText.length - 1200;
    return { success: false, error: `Feedback must be 1,200 characters or less. Please remove ${excess} characters.` };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("CONFIG ERROR: Supabase credentials missing");
    return { success: false, error: "We are currently unable to save feedback. Please try again later." };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("general_feedback")
      .insert([
        {
          feedback_text: feedbackText,
          full_name: fullName || null,
          email_address: email || null,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Database error (general_feedback):", error);
      return { success: false, error: "We could not save your feedback right now. Please try again later." };
    }

    return { success: true, recordId: data.id };
  } catch (err: any) {
    console.error("Unexpected error in handleGeneralFeedback:", err);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}