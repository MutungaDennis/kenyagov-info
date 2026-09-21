"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Script from "next/script";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { adminPath } from "@/lib/admin-path";
import {
  createBrowserClientAsync,
  createClient,
} from "@/lib/supabase/client";
import {
  hasRealSupabasePublicEnv,
  readSupabasePublicEnv,
} from "@/lib/supabase/env";

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        },
      ): string;

      reset(
        widgetId?: string | HTMLElement,
      ): void;

      remove(
        widgetId?: string | HTMLElement,
      ): void;

      getResponse(
        widgetId?: string | HTMLElement,
      ): string;
    };

    onTurnstileLoad?: () => void;
  }
}

type FieldErrors = {
  email?: boolean;
  password?: boolean;
};

type AuthenticationError = {
  message?: string;
  code?: string;
  status?: number;
} | null;

function mapAuthenticationError(
  error: AuthenticationError,
): string {
  const message =
    error?.message?.toLowerCase() ?? "";

  const code =
    error?.code?.toLowerCase() ?? "";

  if (
    code === "invalid_credentials" ||
    message.includes(
      "invalid login credentials",
    )
  ) {
    return "The email address or password is incorrect.";
  }

  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "Confirm your email address before signing in.";
  }

  if (
    message.includes("captcha") ||
    message.includes("captcha_token")
  ) {
    return "The security check failed or expired. Complete it again and retry.";
  }

  if (
    code === "over_request_rate_limit" ||
    message.includes("too many requests") ||
    error?.status === 429
  ) {
    return "Too many sign-in attempts have been made. Wait a few minutes before trying again.";
  }

  return "Sign-in was unsuccessful. Check your details and try again.";
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorSummaryRef =
    useRef<HTMLDivElement>(null);

  const emailInputRef =
    useRef<HTMLInputElement>(null);

  const captchaContainerRef =
    useRef<HTMLDivElement>(null);

  const captchaWidgetIdRef =
    useRef<string | null>(null);

  const supabaseRef =
    useRef<SupabaseClient | null>(null);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    clientReady,
    setClientReady,
  ] = useState(false);

  const [
    captchaToken,
    setCaptchaToken,
  ] = useState("");

  const [
    captchaSolved,
    setCaptchaSolved,
  ] = useState(false);

  const [
    turnstileReady,
    setTurnstileReady,
  ] = useState(false);

  const turnstileSiteKey =
    process.env
      .NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ?.trim() ?? "";

  const captchaRequired =
    turnstileSiteKey.length > 0;

  const canSubmit =
    clientReady &&
    !isSubmitting &&
    (!captchaRequired ||
      captchaSolved ||
      captchaToken.length > 10);

  /*
   * Initialise the browser Supabase client.
   */
  useEffect(() => {
    let cancelled = false;

    async function initialiseSupabase() {
      try {
        const client =
          await createBrowserClientAsync();

        if (cancelled) {
          return;
        }

        supabaseRef.current = client;

        const environment =
          readSupabasePublicEnv();

        if (
          !hasRealSupabasePublicEnv(
            environment,
          )
        ) {
          setClientReady(false);

          setErrorMessage(
            "The authentication service is currently unavailable. Please try again later.",
          );

          return;
        }

        setClientReady(true);
      } catch (error) {
        console.error(
          "Could not initialise Supabase:",
          error,
        );

        if (cancelled) {
          return;
        }

        try {
          const fallbackClient =
            createClient();

          const environment =
            readSupabasePublicEnv();

          supabaseRef.current =
            fallbackClient;

          if (
            hasRealSupabasePublicEnv(
              environment,
            )
          ) {
            setClientReady(true);
          } else {
            setClientReady(false);

            setErrorMessage(
              "The authentication service is currently unavailable. Please try again later.",
            );
          }
        } catch (fallbackError) {
          console.error(
            "Supabase fallback failed:",
            fallbackError,
          );

          setClientReady(false);

          setErrorMessage(
            "The authentication service is currently unavailable. Please try again later.",
          );
        }
      }
    }

    void initialiseSupabase();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Show messages passed by the server-side authorization layer.
   */
  useEffect(() => {
    const error =
      searchParams.get("error");

    const message =
      searchParams.get("message");

    if (error === "unauthorized") {
      setSuccessMessage(null);

      setErrorMessage(
        "This account does not have administrator access.",
      );

      setFieldErrors({});
    }

    if (message === "password-updated") {
      setErrorMessage(null);

      setSuccessMessage(
        "Your password has been updated. You can now sign in.",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (
      errorMessage &&
      errorSummaryRef.current
    ) {
      errorSummaryRef.current.focus();
    }
  }, [errorMessage]);

  const resetTurnstile =
    useCallback(() => {
      setCaptchaToken("");
      setCaptchaSolved(false);

      try {
        if (
          captchaWidgetIdRef.current &&
          window.turnstile
        ) {
          window.turnstile.reset(
            captchaWidgetIdRef.current,
          );
        }
      } catch (error) {
        console.error(
          "Could not reset Turnstile:",
          error,
        );
      }
    }, []);

  const mountTurnstile =
    useCallback(() => {
      if (!captchaRequired) {
        setCaptchaSolved(true);
        return;
      }

      if (
        !window.turnstile ||
        !captchaContainerRef.current ||
        captchaWidgetIdRef.current
      ) {
        return;
      }

      captchaContainerRef.current.innerHTML =
        "";

      try {
        const widgetId =
          window.turnstile.render(
            captchaContainerRef.current,
            {
              sitekey: turnstileSiteKey,
              theme: "light",

              callback(token) {
                setCaptchaToken(token);
                setCaptchaSolved(true);

                setErrorMessage(
                  (currentMessage) =>
                    currentMessage ===
                    "Complete the security check before signing in."
                      ? null
                      : currentMessage,
                );
              },

              "error-callback"() {
                setCaptchaToken("");
                setCaptchaSolved(false);

                setErrorMessage(
                  "The security check could not be completed. Refresh it and try again.",
                );
              },

              "expired-callback"() {
                setCaptchaToken("");
                setCaptchaSolved(false);
              },

              "timeout-callback"() {
                setCaptchaToken("");
                setCaptchaSolved(false);
              },
            },
          );

        captchaWidgetIdRef.current =
          widgetId;

        setTurnstileReady(true);
      } catch (error) {
        console.error(
          "Turnstile rendering failed:",
          error,
        );

        setCaptchaToken("");
        setCaptchaSolved(false);

        setErrorMessage(
          "The security check failed to load. Refresh the page and try again.",
        );
      }
    }, [
      captchaRequired,
      turnstileSiteKey,
    ]);

  useEffect(() => {
    if (!captchaRequired) {
      setCaptchaSolved(true);
      return;
    }

    if (window.turnstile) {
      mountTurnstile();
    } else {
      window.onTurnstileLoad =
        mountTurnstile;
    }

    return () => {
      if (
        window.onTurnstileLoad ===
        mountTurnstile
      ) {
        delete window.onTurnstileLoad;
      }

      try {
        if (
          captchaWidgetIdRef.current &&
          window.turnstile
        ) {
          window.turnstile.remove(
            captchaWidgetIdRef.current,
          );
        }
      } catch {
        // Widget may already have been removed.
      }

      captchaWidgetIdRef.current = null;
    };
  }, [
    captchaRequired,
    mountTurnstile,
  ]);

  function getCaptchaToken(): string {
    if (!captchaRequired) {
      return "";
    }

    if (captchaToken.length > 10) {
      return captchaToken;
    }

    try {
      if (
        captchaWidgetIdRef.current &&
        window.turnstile
      ) {
        return (
          window.turnstile.getResponse(
            captchaWidgetIdRef.current,
          ) ?? ""
        );
      }

      if (
        captchaContainerRef.current &&
        window.turnstile
      ) {
        return (
          window.turnstile.getResponse(
            captchaContainerRef.current,
          ) ?? ""
        );
      }
    } catch {
      return "";
    }

    return "";
  }

  async function handleLogin(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const normalizedEmail =
      email.trim().toLowerCase();

    const errors: FieldErrors = {};

    if (!normalizedEmail) {
      errors.email = true;
    }

    if (!password) {
      errors.password = true;
    }

    if (
      Object.keys(errors).length > 0
    ) {
      setFieldErrors(errors);

      setErrorMessage(
        "Enter your email address and password.",
      );

      return;
    }

    const currentCaptchaToken =
      getCaptchaToken();

    if (
      captchaRequired &&
      currentCaptchaToken.length <= 10
    ) {
      setErrorMessage(
        "Complete the security check before signing in.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const supabase =
        supabaseRef.current ??
        (await createBrowserClientAsync());

      supabaseRef.current = supabase;

      const credentials: {
        email: string;
        password: string;
        options?: {
          captchaToken: string;
        };
      } = {
        email: normalizedEmail,
        password,
      };

      if (
        currentCaptchaToken.length > 10
      ) {
        credentials.options = {
          captchaToken:
            currentCaptchaToken,
        };
      }

      const {
        data: authentication,
        error: authenticationError,
      } =
        await supabase.auth
          .signInWithPassword(
            credentials,
          );

      if (
        authenticationError ||
        !authentication.user
      ) {
        console.error(
          "Supabase sign-in failed:",
          authenticationError,
        );

        setFieldErrors({
          email: true,
          password: true,
        });

        setErrorMessage(
          mapAuthenticationError(
            authenticationError,
          ),
        );

        resetTurnstile();
        return;
      }

      /*
       * Authentication succeeded.
       *
       * Do not perform a browser-side profiles lookup here. Client-side
       * authorization is not the security boundary.
       *
       * The following request is independently protected by:
       *
       * 1. proxy.ts
       * 2. app/admin/(protected)/layout.tsx
       * 3. requireAdmin() in lib/supabase/server.ts
       *
       * A full navigation ensures the newly issued Supabase cookies are
       * attached to the next request.
       */
      setFieldErrors({});
      setErrorMessage(null);

      window.location.assign(
        adminPath(),
      );
    } catch (error) {
      console.error(
        "Unexpected sign-in failure:",
        error,
      );

      setErrorMessage(
        "The sign-in service is temporarily unavailable. Please try again.",
      );

      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordResetRequest() {
    if (isSubmitting) {
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setFieldErrors({
        email: true,
      });

      setErrorMessage(
        "Enter your email address before selecting Forgotten password.",
      );

      emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase =
        supabaseRef.current ??
        (await createBrowserClientAsync());

      supabaseRef.current = supabase;

      const { error } =
        await supabase.auth
          .resetPasswordForEmail(
            normalizedEmail,
            {
              redirectTo:
                `${window.location.origin}${adminPath(
                  "reset-password",
                )}`,
            },
          );

      if (error) {
        console.error(
          "Password reset request failed:",
          error,
        );

        setErrorMessage(
          "The password reset request could not be completed. Wait a moment and try again.",
        );

        return;
      }

      router.push(
        `${adminPath(
          "forgot-password",
        )}?email=${encodeURIComponent(
          normalizedEmail,
        )}`,
      );
    } catch (error) {
      console.error(
        "Unexpected password reset failure:",
        error,
      );

      setErrorMessage(
        "The password reset service is temporarily unavailable. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-8">
      {captchaRequired && (
        <Script
          id="cloudflare-turnstile"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad"
          strategy="afterInteractive"
          onLoad={() => {
            setTurnstileReady(true);
            mountTurnstile();
          }}
          onError={() => {
            setTurnstileReady(false);
            setCaptchaSolved(false);

            setErrorMessage(
              "The security check failed to load. Refresh the page and try again.",
            );
          }}
        />
      )}

      {successMessage && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="alert"
          aria-labelledby="success-title"
        >
          <div className="govuk-notification-banner__content">
            <h2
              id="success-title"
              className="govuk-notification-banner__heading"
            >
              {successMessage}
            </h2>
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
          <h2
            id="error-summary-title"
            className="govuk-error-summary__title"
          >
            There is a problem
          </h2>

          <div className="govuk-error-summary__body">
            <p className="govuk-body">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      <h1 className="govuk-heading-xl">
        Sign in to the admin console
      </h1>

      <p className="govuk-body">
        This area is restricted to
        authorised CitizenGuide.KE
        administrators.
      </p>

      <form
        onSubmit={handleLogin}
        noValidate
      >
        <div
          className={`govuk-form-group${
            fieldErrors.email
              ? " govuk-form-group--error"
              : ""
          }`}
        >
          <label
            className="govuk-label"
            htmlFor="email"
          >
            Email address
          </label>

          {fieldErrors.email && (
            <p
              id="email-error"
              className="govuk-error-message"
            >
              <span className="govuk-visually-hidden">
                Error:
              </span>{" "}
              Enter a valid email address
            </p>
          )}

          <input
            ref={emailInputRef}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className={`govuk-input${
              fieldErrors.email
                ? " govuk-input--error"
                : ""
            }`}
            value={email}
            onChange={(event) => {
              setEmail(
                event.target.value,
              );

              if (fieldErrors.email) {
                setFieldErrors(
                  (current) => ({
                    ...current,
                    email: false,
                  }),
                );
              }
            }}
            aria-invalid={
              fieldErrors.email
                ? "true"
                : undefined
            }
            aria-describedby={
              fieldErrors.email
                ? "email-error"
                : undefined
            }
            disabled={isSubmitting}
          />
        </div>

        <div
          className={`govuk-form-group${
            fieldErrors.password
              ? " govuk-form-group--error"
              : ""
          }`}
        >
          <label
            className="govuk-label"
            htmlFor="password"
          >
            Password
          </label>

          {fieldErrors.password && (
            <p
              id="password-error"
              className="govuk-error-message"
            >
              <span className="govuk-visually-hidden">
                Error:
              </span>{" "}
              Enter your password
            </p>
          )}

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`govuk-input${
              fieldErrors.password
                ? " govuk-input--error"
                : ""
            }`}
            value={password}
            onChange={(event) => {
              setPassword(
                event.target.value,
              );

              if (
                fieldErrors.password
              ) {
                setFieldErrors(
                  (current) => ({
                    ...current,
                    password: false,
                  }),
                );
              }
            }}
            aria-invalid={
              fieldErrors.password
                ? "true"
                : undefined
            }
            aria-describedby={
              fieldErrors.password
                ? "password-error"
                : undefined
            }
            disabled={isSubmitting}
          />
        </div>

        {captchaRequired && (
          <div className="govuk-form-group">
            <label
              className="govuk-label"
              htmlFor="turnstile-widget"
            >
              Security check
            </label>

            <div
              id="turnstile-widget"
              ref={
                captchaContainerRef
              }
            />

            <p className="govuk-hint">
              {captchaSolved
                ? "Security check complete."
                : turnstileReady
                  ? "Complete the security check to continue."
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
          {isSubmitting
            ? "Signing in…"
            : !clientReady
              ? "Connecting…"
              : captchaRequired &&
                  !captchaSolved
                ? "Complete security check to sign in"
                : "Sign in"}
        </button>

        <p className="govuk-body">
          <button
            type="button"
            className="govuk-link"
            disabled={
              isSubmitting ||
              !clientReady
            }
            onClick={() => {
              void handlePasswordResetRequest();
            }}
            style={{
              appearance: "none",
              background: "none",
              border: 0,
              color: "#1d70b8",
              cursor:
                isSubmitting ||
                !clientReady
                  ? "not-allowed"
                  : "pointer",
              font: "inherit",
              padding: 0,
              textDecoration:
                "underline",
            }}
          >
            Forgotten your password?
          </button>
        </p>
      </form>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-8">
      <h1 className="govuk-heading-xl">
        Sign in to the admin console
      </h1>

      <p className="govuk-body">
        Loading the secure sign-in
        service…
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={<LoginPageFallback />}
    >
      <AdminLoginForm />
    </Suspense>
  );
}