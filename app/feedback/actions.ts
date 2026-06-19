"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Robust server-side verification for Cloudflare Turnstile tokens.
 * Gracefully captures ISP network interceptions and HTML pages.
 */
async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.error(
      "CRITICAL CONFIGURATION ERROR: 'TURNSTILE_SECRET_KEY' is missing from your server environment variables."
    );
    return false;
  }

  try {
    const verificationPayload = new URLSearchParams();
    verificationPayload.append("secret", secretKey);
    verificationPayload.append("response", token);

    const response = await fetch("https://cloudflare.com", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verificationPayload.toString(),
    });

    const rawText = await response.text();

    // Check if the response is valid JSON or an HTML error page from Safaricom/ISP
    if (!rawText.trim().startsWith("{")) {
      console.error(
        "NETWORK ANOMALY: Your internet provider, router, or local firewall intercepted the Cloudflare API request."
      );
      console.error("Received HTML instead of JSON. Snippet of intercepted content:", rawText.substring(0, 250));
      return false;
    }

    const data = JSON.parse(rawText);
    
    if (!data.success) {
      console.error("Cloudflare Turnstile rejected the token. Error codes:", data["error-codes"]);
    }
    
    return data.success;
  } catch (error) {
    console.error("Turnstile validation hit a network connection exception:", error);
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return { success: false, error: "Server configuration missing database credentials." };
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error } = await supabase.from("citizen_feedback").insert([
      {
        what_were_you_doing: doing,
        what_went_wrong: wrong,
        email_address: email || null,
        page_path: pagePath || "/unknown",
      }
    ]);

    if (error) return { success: false, error: `Database Error: ${error.message}` };
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return { success: false, error: "Server configuration missing database credentials." };
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error } = await supabase.from("general_feedback").insert([
      {
        feedback_text: feedbackText,
        full_name: fullName || null,
        email_address: email || null,
      }
    ]);

    if (error) return { success: false, error: `Database Error: ${error.message}` };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Server Exception: ${err.message || err}` };
  }
}
