"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Extend Window for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ): string | undefined;
      reset(container?: HTMLElement | string): void;
      getResponse(container?: HTMLElement | string): string;
      remove(container?: HTMLElement | string): void;
    };
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("dennis.mutunga14@gmail.com"); // prefilled for the main admin
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: boolean; password?: boolean }>({});
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const captchaWidgetRef = useRef<HTMLDivElement>(null);
  const [captchaSolved, setCaptchaSolved] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  // Show messages from redirects (unauthorized, password reset success, etc.)
  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error === "unauthorized") {
      setErrorMessage("You do not have permission to access the admin area. Please sign in with an admin account.");
    }

    if (message === "password-updated") {
      setErrorMessage(null);
      setSuccessMessage("Your password has been updated successfully. Please sign in.");
    }
  }, [searchParams]);

  // Auto-focus email field (GOV.UK pattern)
  useEffect(() => {
    if (emailInputRef.current) emailInputRef.current.focus();
  }, []);

  // Shift focus to error summary when error appears
  useEffect(() => {
    if (errorMessage && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [errorMessage]);

  // Render Turnstile widget only in production (in dev we auto-solve to bypass captcha issues on localhost).
  // The script is loaded globally once.
  useEffect(() => {
    if (isDev) {
      setCaptchaSolved(true);
      return;
    }

    const renderWidget = () => {
      if (window.turnstile && captchaWidgetRef.current && !captchaWidgetRef.current.dataset.rendered) {
        window.turnstile.render(captchaWidgetRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          theme: 'light',
          callback: (token: string) => {
            setCaptchaToken(token);
            setCaptchaSolved(true);
          },
          'error-callback': () => {
            setCaptchaToken('');
            setCaptchaSolved(false);
          },
        });
        captchaWidgetRef.current.dataset.rendered = 'true';
      }
    };

    renderWidget();

    const interval = setInterval(() => {
      if (window.turnstile) {
        renderWidget();
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isDev]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setErrors({});

    const currentErrors: { email?: boolean; password?: boolean } = {};
    if (!email.trim()) currentErrors.email = true;
    if (!password.trim()) currentErrors.password = true;

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      setErrorMessage("Enter your email address and password to sign in.");
      return;
    }

    startTransition(async () => {
      const tokenToUse = isDev ? undefined : captchaToken;

      if (!isDev && !tokenToUse) {
        setErrorMessage('Please complete the Turnstile security check.');
        setErrors({ email: true, password: true });
        return;
      }

      // Perform sign-in using the browser client (sets cookies via SSR helpers)
      // Include captchaToken only when not in dev (to avoid localhost issues).
      // In dev we skip the token; if Supabase still requires it you will get the captcha error
      // and should disable "Enable Captcha protection" in Supabase for development.
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: tokenToUse ? { captchaToken: tokenToUse } : undefined,
      });

      if (error || !data.user) {
        console.error('Supabase AuthApiError (full):', error);

        const raw = error?.message || '';
        const lower = raw.toLowerCase();

        let message = raw || "The email address or password you entered is incorrect.";

        if (lower.includes('captcha') || lower.includes('captcha_token')) {
          message = isDev
            ? 'Captcha error in dev (localhost token not accepted). Go to Supabase → Authentication → turn OFF “Enable Captcha protection” (or add "localhost" to your Turnstile allowed domains).'
            : 'CAPTCHA / Turnstile token issue. Complete the security widget shown on this form, then try again.';
        }

        setErrorMessage(message);
        setErrors({ email: true, password: true });

        // Reset widget and clear token for retry
        setCaptchaToken('');
        setCaptchaSolved(false);
        try {
          const ts = window.turnstile;
          if (ts && captchaWidgetRef.current) {
            ts.reset(captchaWidgetRef.current);
          }
        } catch {}
        return;
      }

      // Ensure a profile row exists for first-time users (is_admin=false by default).
      // IMPORTANT: We never overwrite is_admin. An admin can safely set it to true in the database.
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existing) {
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              is_admin: false,
            });
        }
      } catch {}

      // Bootstrap (temporary): primary admin email always proceeds to dashboard.
      // TODO: remove once profiles.is_admin = true is set via SQL for dennis.mutunga14@gmail.com
      if (data.user.email === 'dennis.mutunga14@gmail.com') {
        window.location.href = '/admin';
        return;
      }

      // Immediately verify admin status client-side for better UX.
      // If not admin, sign out immediately and show clear message.
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        if (!profile?.is_admin) {
          await supabase.auth.signOut();
          setErrorMessage(
            "This account is not yet marked as admin. Run the SQL in scripts/promote-admin.sql (or paste it in Supabase SQL Editor) to set is_admin = true for dennis.mutunga14@gmail.com."
          );
          setErrors({ email: true, password: true });
          return;
        }
      } catch {
        // If profiles table doesn't exist or query fails, treat as non-admin for safety
        await supabase.auth.signOut();
        setErrorMessage("The profiles table is missing or not accessible. Please run scripts/promote-admin.sql in Supabase SQL Editor first.");
        setErrors({ email: true, password: true });
        return;
      }

      // Success — hard navigation so middleware and layout see fresh session.
      window.location.href = '/admin';
    });
  }

  async function handlePasswordResetRequest() {
    if (!email.trim()) {
      setErrorMessage("Enter your email address above, then click 'Forgot password?'");
      setErrors({ email: true });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      setErrorMessage("Could not send password reset email. Please try again.");
    } else {
      setErrorMessage(null);
      // Navigate to a dedicated forgot-password page for better messaging
      router.push(`/admin/forgot-password?email=${encodeURIComponent(email.trim())}`);
    }
  }

  return (
    <div
      className="govuk-width-container govuk-!-margin-top-8"
      style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "40px auto", padding: "0 15px" }}
    >
      {/* Success banner (for password reset, etc.) */}
      {successMessage && (
        <div
          role="alert"
          style={{
            border: "4px solid #00703c",
            padding: "20px",
            marginBottom: "30px",
            background: "#f3f2f1",
          }}
        >
          <p style={{ color: "#00703c", fontSize: "19px", margin: 0, fontWeight: "bold" }}>
            {successMessage}
          </p>
        </div>
      )}

      {/* GOV.UK Error Summary */}
      {errorMessage && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          className="govuk-error-summary"
          role="alert"
          style={{
            border: "4px solid #d4351c",
            padding: "20px",
            marginBottom: "30px",
            background: "#ffffff",
            outline: "none",
          }}
        >
          <h2
            className="govuk-error-summary__title"
            style={{ color: "#d4351c", fontSize: "24px", fontWeight: "bold", margin: "0 0 10px 0" }}
          >
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <p
              className="govuk-body"
              style={{ color: "#d4351c", fontSize: "19px", margin: 0, fontWeight: "bold" }}
            >
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      <h1
        className="govuk-heading-xl"
        style={{ fontSize: "38px", fontWeight: "bold", marginBottom: "8px", color: "#0b0c0c" }}
      >
        Sign in to the admin console
      </h1>

      <div
        className="govuk-inset-text"
        style={{
          fontSize: "16px",
          backgroundColor: "#f3f2f1",
          padding: "12px 16px",
          borderLeft: "5px solid #1d70b8",
          marginBottom: "24px",
        }}
      >
        <strong>Dev mode:</strong> Widget bypassed, button enabled. If login still fails with captcha error, disable “Enable Captcha protection” in Supabase dashboard (it is separate from the widget on /feedback).
      </div>

      <form onSubmit={handleLogin} noValidate>
        {/* Email */}
        <div
          className={`govuk-form-group ${errors.email ? "govuk-form-group--error" : ""}`}
          style={{ marginBottom: "25px" }}
        >
          <label
            className="govuk-label"
            htmlFor="email"
            style={{ display: "block", fontSize: "19px", fontWeight: "bold", marginBottom: "5px", color: "#0b0c0c" }}
          >
            Email address
          </label>

          {errors.email && (
            <p
              id="email-error"
              className="govuk-error-message"
              style={{ color: "#d4351c", fontSize: "19px", fontWeight: "bold", margin: "0 0 5px 0" }}
            >
              <span className="govuk-visually-hidden">Error:</span> Enter your email address
            </p>
          )}

          <input
            ref={emailInputRef}
            className="govuk-input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "19px",
              fontFamily: "sans-serif",
              border: errors.email ? "4px solid #d4351c" : "2px solid #0b0c0c",
              borderRadius: 0,
              boxSizing: "border-box",
            }}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>

        {/* Password */}
        <div
          className={`govuk-form-group ${errors.password ? "govuk-form-group--error" : ""}`}
          style={{ marginBottom: "35px" }}
        >
          <label
            className="govuk-label"
            htmlFor="password"
            style={{ display: "block", fontSize: "19px", fontWeight: "bold", marginBottom: "5px", color: "#0b0c0c" }}
          >
            Password
          </label>

          {errors.password && (
            <p
              id="password-error"
              className="govuk-error-message"
              style={{ color: "#d4351c", fontSize: "19px", fontWeight: "bold", margin: "0 0 5px 0" }}
            >
              <span className="govuk-visually-hidden">Error:</span> Enter your password
            </p>
          )}

          <input
            className="govuk-input"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "19px",
              fontFamily: "sans-serif",
              border: errors.password ? "4px solid #d4351c" : "2px solid #0b0c0c",
              borderRadius: 0,
              boxSizing: "border-box",
            }}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
        </div>

        {/* Turnstile widget only in prod. In dev, bypass completely (button always enabled, no token sent). */}
        {!isDev && (
          <div className="govuk-form-group" style={{ marginBottom: "16px" }}>
            <div
              ref={captchaWidgetRef}
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-theme="light"
            />
            <p className="govuk-hint" style={{ fontSize: "14px", marginTop: "4px" }}>
              Complete the security check above if prompted.
            </p>
          </div>
        )}

        {/* Primary Sign In Button */}
        <button
          type="submit"
          disabled={isPending || (!isDev && !captchaSolved)}
          className="govuk-button"
          style={{
            backgroundColor: "#00703c",
            color: "#ffffff",
            padding: "10px 20px",
            fontSize: "19px",
            fontWeight: "bold",
            border: "none",
            borderRadius: 0,
            cursor: (isPending || (!isDev && !captchaSolved)) ? "not-allowed" : "pointer",
            boxShadow: "0 2px 0 #002d18",
            display: "block",
            width: "100%",
            marginBottom: "12px",
          }}
        >
          {isPending ? "Signing in..." : (isDev || captchaSolved ? "Sign in" : "Complete security check to sign in")}
        </button>

        {/* Password Reset Link */}
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={handlePasswordResetRequest}
            style={{
              background: "none",
              border: "none",
              color: "#1d70b8",
              textDecoration: "underline",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Forgot your password?
          </button>
        </div>
      </form>

      <p
        style={{
          marginTop: "40px",
          fontSize: "14px",
          color: "#505a5f",
          textAlign: "center",
        }}
      >
        This area is restricted to authorised administrators only.
      </p>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666", textAlign: "center", lineHeight: 1.4 }}>
        <strong>Having trouble signing in?</strong><br />
        This error is often caused by CAPTCHA protection in Supabase.<br />
        Go to Supabase Dashboard → <strong>Authentication → Providers → Email</strong> and turn <strong>OFF</strong> CAPTCHA.<br />
        (Safe to disable for this internal admin area.)
      </div>
    </div>
  );
}
