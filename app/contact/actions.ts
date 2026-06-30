"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

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

export async function handleContactMessage(formData: FormData, turnstileToken: string) {
  const isValid = await verifyTurnstileToken(turnstileToken);
  if (!isValid) {
    return { success: false, error: "We could not verify the security check. Please refresh the page and try again." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = (formData.get("subject") as string) || "";
  const message = (formData.get("message") as string) || "";

  // Validation
  if (!subject.trim()) {
    return { success: false, error: "Enter a subject for your message." };
  }

  if (!message.trim()) {
    return { success: false, error: "Enter your message." };
  }

  if (message.length > 2000) {
    const excess = message.length - 2000;
    return { success: false, error: `Your message must be 2,000 characters or less. Please remove ${excess} characters.` };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("CONFIG ERROR: Supabase credentials missing");
    return { success: false, error: "We are currently unable to save your message. Please try again later." };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("contact_messages")           // ← Updated table name
      .insert([
        {
          name: name || null,
          email: email || null,
          subject: subject.trim(),
          message: message.trim(),
          phone: null,                    // Not collected in form
          contact_type: "general_inquiry", // Default value
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Database error (contact_messages):", error);
      return { success: false, error: "We could not save your message right now. Please try again later." };
    }

    return { success: true, recordId: data.id };
  } catch (err: any) {
    console.error("Unexpected error in handleContactMessage:", err);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}