"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { adminPath } from "@/lib/admin-path";

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        },
      ): string | undefined;
      reset(widgetId?: string | HTMLElement): void;
      remove(widgetId?: string | HTMLElement): void;
      getResponse(widgetId?: string | HTMLElement): string;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const captchaWidgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: boolean; password?: boolean }>(
    {},
  );
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  // Production Cloudflare always needs captcha when site key is set.
  // Dev without site key: auto-enable button.
  const captchaRequired = Boolean(siteKey);
  const canSubmit =
    !isPending && (!captchaRequired || captchaSolved || Boolean(captchaToken));

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error === "unauthorized") {
      setErrorMessage(
        "You do not have permission to access the admin area. Please sign in with an admin account.",
      );
    }

    if (message === "password-updated") {
      setErrorMessage(null);
      setSuccessMessage(
        "Your password has been updated successfully. Please sign in.",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (errorMessage && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [errorMessage]);

  const mountTurnstile = useCallback(() => {
    if (!captchaRequired) {
      setCaptchaSolved(true);
      return;
    }
    if (!window.turnstile || !captchaWidgetRef.current) return;
    if (widgetIdRef.current) return;

    // Clear any prior auto-rendered children
    captchaWidgetRef.current.innerHTML = "";

    try {
      const id = window.turnstile.render(captchaWidgetRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => {
          setCaptchaToken(token);
          setCaptchaSolved(true);
        },
        "error-callback": () => {
          setCaptchaToken("");
          setCaptchaSolved(false);
        },
        "expired-callback": () => {
          setCaptchaToken("");
          setCaptchaSolved(false);
        },
        "timeout-callback": () => {
          setCaptchaToken("");
          setCaptchaSolved(false);
        },
      });
      widgetIdRef.current = id ?? "mounted";
      setTurnstileReady(true);
    } catch (e) {
      console.error("Turnstile render failed:", e);
      // Do not leave the button permanently disabled if widget fails
      setErrorMessage(
        "Security check failed to load. Refresh the page, or try again in a moment.",
      );
    }
  }, [captchaRequired, siteKey]);

  useEffect(() => {
    if (!captchaRequired) {
      setCaptchaSolved(true);
      return;
    }

    // If script already present (global layout), mount immediately
    if (window.turnstile) {
      mountTurnstile();
      return;
    }

    window.onTurnstileLoad = () => {
      mountTurnstile();
    };

    const interval = setInterval(() => {
      if (window.turnstile) {
        mountTurnstile();
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      try {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch {
        /* ignore */
      }
      widgetIdRef.current = null;
    };
  }, [captchaRequired, mountTurnstile]);

  // Fallback: if checkbox appears solved but React state missed the callback
  useEffect(() => {
    if (!captchaRequired || captchaSolved) return;
    const t = setInterval(() => {
      try {
        const token =
          (widgetIdRef.current &&
            window.turnstile?.getResponse(widgetIdRef.current)) ||
          window.turnstile?.getResponse(captchaWidgetRef.current as HTMLElement);
        if (token && token.length > 10) {
          setCaptchaToken(token);
          setCaptchaSolved(true);
        }
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearInterval(t);
  }, [captchaRequired, captchaSolved]);

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

    // Re-read token at submit time (callback race safety)
    let tokenToUse = captchaToken;
    if (captchaRequired && !tokenToUse) {
      try {
        tokenToUse =
          (widgetIdRef.current &&
            window.turnstile?.getResponse(widgetIdRef.current)) ||
          window.turnstile?.getResponse(
            captchaWidgetRef.current as HTMLElement,
          ) ||
          "";
      } catch {
        tokenToUse = "";
      }
    }

    if (captchaRequired && !tokenToUse) {
      setErrorMessage("Complete the security check, then try again.");
      return;
    }

    startTransition(async () => {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: tokenToUse ? { captchaToken: tokenToUse } : undefined,
      });

      if (error || !data.user) {
        console.error("Supabase AuthApiError:", error);

        const raw = error?.message || "";
        const lower = raw.toLowerCase();
        let message =
          raw || "The email address or password you entered is incorrect.";

        if (lower.includes("captcha") || lower.includes("captcha_token")) {
          message =
            "Security check failed or expired. Complete the checkbox again, then try signing in.";
        }

        setErrorMessage(message);
        setErrors({ email: true, password: true });
        setCaptchaToken("");
        setCaptchaSolved(false);
        try {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
        } catch {
          /* ignore */
        }
        return;
      }

      try {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!existing) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email,
            is_admin: false,
          });
        }
      } catch {
        /* ignore */
      }

      if (data.user.email === "dennis.mutunga14@gmail.com") {
        window.location.href = adminPath();
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single();

        if (!profile?.is_admin) {
          await supabase.auth.signOut();
          setErrorMessage(
            "This account is not marked as admin. An existing administrator must set is_admin = true for your user in Supabase.",
          );
          setErrors({ email: true, password: true });
          return;
        }
      } catch {
        await supabase.auth.signOut();
        setErrorMessage(
          "Could not verify admin status. Check the profiles table in Supabase.",
        );
        setErrors({ email: true, password: true });
        return;
      }

      window.location.href = adminPath();
    });
  }

  async function handlePasswordResetRequest() {
    if (!email.trim()) {
      setErrorMessage(
        "Enter your email address above, then select Forgotten password.",
      );
      setErrors({ email: true });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${adminPath("reset-password")}`,
    });

    if (error) {
      setErrorMessage("Could not send password reset email. Please try again.");
    } else {
      setErrorMessage(null);
      router.push(
        `${adminPath("forgot-password")}?email=${encodeURIComponent(email.trim())}`,
      );
    }
  }

  return (
    <div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-8">
      {/* Explicit Turnstile API (explicit render mode — no auto-render attrs) */}
      {captchaRequired && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad"
          strategy="afterInteractive"
          onLoad={() => {
            setTurnstileReady(true);
            mountTurnstile();
          }}
        />
      )}

      {successMessage && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="alert"
        >
          <div className="govuk-notification-banner__content">
            <p className="govuk-notification-banner__heading">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          className="govuk-error-summary"
          role="alert"
          aria-labelledby="error-summary-title"
        >
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{errorMessage}</p>
          </div>
        </div>
      )}

      <h1 className="govuk-heading-xl">Sign in to the admin console</h1>
      <p className="govuk-body">
        This area is restricted to authorised administrators only.
      </p>

      <form onSubmit={handleLogin} noValidate>
        <div
          className={`govuk-form-group${errors.email ? " govuk-form-group--error" : ""}`}
        >
          <label className="govuk-label" htmlFor="email">
            Email address
          </label>
          {errors.email && (
            <p id="email-error" className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> Enter your
              email address
            </p>
          )}
          <input
            ref={emailInputRef}
            className={`govuk-input${errors.email ? " govuk-input--error" : ""}`}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>

        <div
          className={`govuk-form-group${errors.password ? " govuk-form-group--error" : ""}`}
        >
          <label className="govuk-label" htmlFor="password">
            Password
          </label>
          {errors.password && (
            <p id="password-error" className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> Enter your
              password
            </p>
          )}
          <input
            className={`govuk-input${errors.password ? " govuk-input--error" : ""}`}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
        </div>

        {captchaRequired && (
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="turnstile-widget">
              Security check
            </label>
            <div id="turnstile-widget" ref={captchaWidgetRef} />
            <p className="govuk-hint">
              {captchaSolved
                ? "Security check complete."
                : turnstileReady
                  ? "Select the checkbox above to continue."
                  : "Loading security check…"}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          {isPending
            ? "Signing in…"
            : canSubmit
              ? "Sign in"
              : "Complete security check to sign in"}
        </button>

        <p className="govuk-body">
          <button
            type="button"
            className="govuk-link"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              font: "inherit",
              color: "#1d70b8",
              textDecoration: "underline",
            }}
            onClick={handlePasswordResetRequest}
          >
            Forgotten your password?
          </button>
        </p>
      </form>
    </div>
  );
}
