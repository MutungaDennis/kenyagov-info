"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { adminPath } from "@/lib/admin-path";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import Turnstile, { useTurnstileConfig } from "@/components/security/Turnstile";

function AdminLoginForm() {
  const params = useSearchParams();
  const config = useTurnstileConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryError = params.get("error") === "unauthorized"
    ? "This account does not have administrator access."
    : params.get("error") === "recovery-expired"
      ? "The password reset link is invalid or expired. Request a new link."
      : null;

  useEffect(() => {
    // Clear any existing non-admin session so a different account can sign in.
    if (params.get("error") === "unauthorized") {
      void createBrowserClientAsync().then(client => client.auth.signOut({ scope: "local" })).catch(() => {});
    }
  }, [params]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !config || (config.enabled && !token)) return;
    setError(null);
    setPending(true);
    try {
      const supabase = await createBrowserClientAsync();
      // Supabase Auth owns siteverify for authentication; do not consume this
      // single-use token in a separate application siteverify call.
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
        options: token ? { captchaToken: token } : undefined,
      });
      if (authError || !data.user) {
        setError(authError?.status === 429
          ? "Too many attempts. Wait a few minutes and try again."
          : "Sign-in failed. Check your credentials and complete the security check again.");
        setToken("");
        setResetKey(value => value + 1);
        return;
      }
      // A fresh request sends the new cookies to the authoritative server guards.
      window.location.assign(adminPath());
    } catch {
      setError("The sign-in service is unavailable. Please try again.");
      setToken("");
      setResetKey(value => value + 1);
    } finally { setPending(false); }
  }

  const canSubmit = !pending && !!config && (!config.enabled || !!token);
  return <div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-8">
    <h1 className="govuk-heading-xl">Sign in to the admin console</h1>
    <p className="govuk-body">This area is restricted to authorised CitizenGuide.KE administrators.</p>
    {params.get("message") === "password-updated" && <p className="govuk-body" role="status">Your password has been updated. You can now sign in.</p>}
    {(error || queryError) && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">There is a problem</h2><p className="govuk-body">{error || queryError}</p></div>}
    <form onSubmit={handleSubmit}>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="email">Email address</label>
        <input className="govuk-input" id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" required value={email} onChange={event => setEmail(event.target.value)} disabled={pending} />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="password">Password</label>
        <input className="govuk-input" id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={pending} />
      </div>
      <Turnstile onToken={setToken} resetKey={resetKey} />
      <button className="govuk-button" type="submit" disabled={!canSubmit}>{pending ? "Signing in..." : "Sign in"}</button>
      <p className="govuk-body"><Link className="govuk-link" href={adminPath("forgot-password")}>Forgotten password?</Link></p>
    </form>
  </div>;
}

export default function AdminLoginPage() {
  return <Suspense fallback={<p className="govuk-body">Loading sign-in...</p>}><AdminLoginForm /></Suspense>;
}
