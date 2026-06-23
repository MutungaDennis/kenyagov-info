"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

/**
 * Robust server-side verification for Cloudflare Turnstile tokens.
 * Includes remote IP for better validation and graceful handling for dev/ISP issues.
 */
async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error(
      "CRITICAL CONFIGURATION ERROR: 'TURNSTILE_SECRET_KEY' is missing from your server environment variables."
    );
    return false;
  }

  // Get client IP if available (for Cloudflare verification)
  const headersList = await headers();
  const remoteIp =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";

  // ============================================================
  // DEVELOPMENT / TEST KEY BYPASS
  // ============================================================
  const isTestSecret = secretKey.includes("000000000000000000000000000000000000000"); // matches test secrets
  const isDev = process.env.NODE_ENV === "development";

  if (isDev || isTestSecret) {
    console.log(
      "⚠️ [DEV BYPASS] Turnstile verification skipped — using test key or development mode. " +
      "Only checking token presence."
    );
    return !!token && token.length > 10;
  }

  // ============================================================
  // PRODUCTION VERIFICATION
  // ============================================================
  try {
    const verificationPayload = new URLSearchParams();
    verificationPayload.append("secret", secretKey);
    verificationPayload.append("response", token);
    if (remoteIp) verificationPayload.append("remoteip", remoteIp);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verificationPayload.toString(),
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("Cloudflare Turnstile rejected the token. Error codes:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Turnstile validation network error:", error);
    // In production, fail closed for security. But log for debugging.
    return false;
  }
}

/**
 * ACTION 1: Handles specific page-context bug and problem logs
 * Used by: components/govuk/ReportProblem.tsx
 */
export async function handleFeedbackSubmission(formData: FormData, turnstileToken: string) {
  const isValidToken = await verifyTurnstileToken(turnstileToken);
  if (!isValidToken) {
    return { success: false, error: "Security check failed. Please refresh the page and try again." };
  }

  const doing = formData.get("doing") as string;
  const wrong = formData.get("wrong") as string;
  const email = formData.get("email") as string;
  const pagePath = formData.get("page_path") as string;

  // Smart database credential check with fallback options
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE CONFIGURATION ERROR (Action 1):");
    console.error("- URL Present:", !!supabaseUrl);
    console.error("- Anon Key Present:", !!process.env.SUPABASE_ANON_KEY);
    console.error("- Service Role Key Present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    return { success: false, error: "Server configuration missing database credentials." };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // FIXED: Selects the newly created record ID upon insert to return to frontend
    const { data, error } = await supabase
      .from("citizen_feedback")
      .insert([
        {
          what_were_you_doing: doing,
          what_went_wrong: wrong,
          email_address: email || null,
          page_path: pagePath || "/unknown",
        }
      ])
      .select("id")
      .single();

    if (error) return { success: false, error: `Database Error: ${error.message}` };
    return { success: true, recordId: data.id };
  } catch (err: any) {
    return { success: false, error: `Server Exception: ${err.message || err}` };
  }
}

/**
 * ACTION 2: Handles overall system improvements from the beta header link
 * Used by: app/feedback/page.tsx
 */
export async function handleGeneralFeedback(formData: FormData, turnstileToken: string) {
  const isValidToken = await verifyTurnstileToken(turnstileToken);
  if (!isValidToken) {
    return { success: false, error: "Security check failed. Please refresh the page and try again." };
  }

  const feedbackText = (formData.get("feedback_text") as string) || "";
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;

  // GOV.UK Strict Validation Guidelines
  if (!feedbackText.trim()) {
    return { success: false, error: "Enter your feedback on how we can improve this website." };
  }
  
  if (feedbackText.length > 1200) {
    const excess = feedbackText.length - 1200;
    return { success: false, error: `Feedback must be 1,200 characters or less. Remove ${excess} characters.` };
  }

  // Smart database credential check with fallback options
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE CONFIGURATION ERROR (Action 2):");
    console.error("- URL Present:", !!supabaseUrl);
    console.error("- Anon Key Present:", !!process.env.SUPABASE_ANON_KEY);
    console.error("- Service Role Key Present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    return { success: false, error: "Server configuration missing database credentials." };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // FIXED: Selects the newly created record ID upon insert to return to frontend
    const { data, error } = await supabase
      .from("general_feedback")
      .insert([
        {
          feedback_text: feedbackText,
          full_name: fullName || null,
          email_address: email || null,
        }
      ])
      .select("id")
      .single();

    if (error) return { success: false, error: `Database Error: ${error.message}` };
    return { success: true, recordId: data.id };
  } catch (err: any) {
    return { success: false, error: `Server Exception: ${err.message || err}` };
  }
}
