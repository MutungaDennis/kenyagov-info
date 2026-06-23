"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      // Supabase recovery flow — at this point the user should have a valid recovery session
      // from clicking the email link. updateUser will set the new password.
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message || "Failed to update password. The link may have expired.");
      } else {
        setSuccess(true);
        // Give the user a moment then redirect to login
        setTimeout(() => {
          router.push("/admin/login?message=password-updated");
        }, 1600);
      }
    });
  }

  return (
    <div
      className="govuk-width-container"
      style={{ maxWidth: "560px", margin: "80px auto", padding: "0 15px", fontFamily: "sans-serif" }}
    >
      <h1 className="govuk-heading-xl" style={{ fontSize: "36px", marginBottom: "8px" }}>
        Set a new password
      </h1>
      <p style={{ color: "#505a5f", fontSize: "18px", marginBottom: "32px" }}>
        Enter and confirm your new password below.
      </p>

      {success ? (
        <div
          style={{
            border: "4px solid #00703c",
            padding: "24px",
            background: "#f3f2f1",
            fontSize: "19px",
          }}
        >
          Password updated successfully. Redirecting you to the login page…
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div
              className="govuk-error-summary"
              role="alert"
              style={{ border: "4px solid #d4351c", padding: "16px", marginBottom: "24px" }}
            >
              <p style={{ color: "#d4351c", fontWeight: "bold", margin: 0 }}>{errorMessage}</p>
            </div>
          )}

          <div className="govuk-form-group" style={{ marginBottom: "20px" }}>
            <label className="govuk-label" htmlFor="new-password" style={{ fontWeight: "bold", fontSize: "19px" }}>
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="govuk-input"
              style={{ width: "100%", padding: "8px", fontSize: "19px", border: "2px solid #0b0c0c" }}
              required
              minLength={8}
            />
            <p className="govuk-hint" style={{ fontSize: "14px", marginTop: "4px" }}>
              Minimum 8 characters.
            </p>
          </div>

          <div className="govuk-form-group" style={{ marginBottom: "28px" }}>
            <label className="govuk-label" htmlFor="confirm-password" style={{ fontWeight: "bold", fontSize: "19px" }}>
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              padding: "10px 28px",
              fontSize: "19px",
              fontWeight: "bold",
              border: "none",
              cursor: isPending ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {isPending ? "Updating password..." : "Update password"}
          </button>
        </form>
      )}

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <a href="/admin/login" className="govuk-link" style={{ fontSize: "16px" }}>
          Back to sign in
        </a>
      </div>
    </div>
  );
}
