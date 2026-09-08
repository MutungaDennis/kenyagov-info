"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { adminPath } from "@/lib/admin-path";
import { createClient } from "@/lib/supabase/client";

export default function AdminForgotPasswordPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        setErrorMessage("Unable to send reset email. Please check the address and try again.");
      } else {
        setMessage(
          "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder)."
        );
      }
    });
  }

  return (
    <div
      className="govuk-width-container"
      style={{ maxWidth: "600px", margin: "60px auto", padding: "0 15px", fontFamily: "sans-serif" }}
    >
      <h1 className="govuk-heading-xl" style={{ fontSize: "38px", fontWeight: "bold", marginBottom: "12px" }}>
        Reset your password
      </h1>
      <p className="govuk-body" style={{ marginBottom: "32px", color: "#505a5f" }}>
        Enter the email address associated with your admin account. We will send you a link to reset your password.
      </p>

      {message && (
        <div
          className="govuk-notification-banner"
          role="region"
          style={{ borderLeft: "5px solid #00703c", padding: "20px", background: "#f3f2f1", marginBottom: "24px" }}
        >
          <p style={{ margin: 0, fontSize: "19px" }}>{message}</p>
        </div>
      )}

      {errorMessage && (
        <div
          className="govuk-error-summary"
          role="alert"
          style={{ border: "4px solid #d4351c", padding: "20px", marginBottom: "24px" }}
        >
          <p style={{ color: "#d4351c", fontWeight: "bold", margin: 0 }}>{errorMessage}</p>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit}>
          <div className="govuk-form-group" style={{ marginBottom: "28px" }}>
            <label className="govuk-label" htmlFor="email" style={{ fontWeight: "bold", fontSize: "19px" }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="govuk-input"
              style={{ width: "100%", padding: "8px", fontSize: "19px", border: "2px solid #0b0c0c" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="govuk-button"
            style={{
              backgroundColor: "#00703c",
              color: "white",
              padding: "10px 24px",
              fontSize: "19px",
              fontWeight: "bold",
              border: "none",
              cursor: isPending ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {isPending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <div style={{ marginTop: "32px" }}>
        <Link href={adminPath()} className="govuk-link" style={{ fontSize: "19px" }}>
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
