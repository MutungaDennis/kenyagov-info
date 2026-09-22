"use client";

import { useEffect, useRef, useState } from "react";

type Config = { enabled: boolean; siteKey: string };
type TurnstileApi = {
  render(container: HTMLElement, options: {
    sitekey: string; theme: "light"; action: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
    "timeout-callback": () => void;
  }): string;
  remove(id: string): void;
  reset(id: string): void;
};

let scriptPromise: Promise<TurnstileApi> | undefined;
function loadTurnstile(): Promise<TurnstileApi> {
  const browser = window as Window & { turnstile?: TurnstileApi };
  if (browser.turnstile) return Promise.resolve(browser.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      const timer = window.setTimeout(() => { script.remove(); reject(new Error("Security check timed out")); }, 15_000);
      script.onload = () => {
        clearTimeout(timer);
        if (browser.turnstile) resolve(browser.turnstile);
        else reject(new Error("Security check unavailable"));
      };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error("Security check unavailable")); };
      document.head.appendChild(script);
    }).catch(error => { scriptPromise = undefined; throw error; });
  }
  return scriptPromise;
}

// Resolve from the Worker: public variables may not have existed at build time.
export function useTurnstileConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public-env", { cache: "no-store", signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => {
        if (typeof data.turnstile?.enabled !== "boolean" || typeof data.turnstile?.siteKey !== "string") throw new Error();
        setConfig(data.turnstile);
      })
      .catch(() => { if (!controller.signal.aborted) setConfig({ enabled: true, siteKey: "" }); });
    return () => controller.abort();
  }, []);
  return config;
}

export function resetTurnstileForm(form: HTMLFormElement) {
  form.dispatchEvent(new Event("turnstile-reset"));
}

export default function Turnstile({ onToken, resetKey = 0 }: {
  onToken?: (token: string) => void;
  resetKey?: number;
}) {
  const config = useTurnstileConfig();
  const container = useRef<HTMLDivElement>(null);
  const tokenCallback = useRef(onToken);
  const [error, setError] = useState(false);
  useEffect(() => { tokenCallback.current = onToken; }, [onToken]);

  useEffect(() => {
    if (!config?.enabled || !config.siteKey || !container.current) return;
    const element = container.current;
    const form = element.closest("form");
    let cancelled = false;
    let api: TurnstileApi | undefined;
    let widgetId: string | undefined;
    const clearToken = () => tokenCallback.current?.("");
    const reset = () => { clearToken(); if (widgetId !== undefined) api?.reset(widgetId); };
    form?.addEventListener("turnstile-reset", reset);
    loadTurnstile().then(loaded => {
      if (cancelled) return;
      api = loaded;
      widgetId = api.render(element, {
        sitekey: config.siteKey, theme: "light", action: "turnstile-spin-v2",
        callback: token => { setError(false); tokenCallback.current?.(token); },
        "expired-callback": clearToken,
        "timeout-callback": clearToken,
        "error-callback": () => { clearToken(); setError(true); },
      });
    }).catch(() => { if (!cancelled) { clearToken(); setError(true); } });
    return () => {
      cancelled = true;
      form?.removeEventListener("turnstile-reset", reset);
      if (widgetId !== undefined) api?.remove(widgetId);
      clearToken();
    };
  }, [config, resetKey]);

  if (config && !config.enabled) return null;
  return <div className="govuk-form-group">
    <div ref={container} data-action="turnstile-spin-v2" />
    {!config && <p className="govuk-hint" role="status">Loading security check…</p>}
    {(error || (config && !config.siteKey)) && <p className="govuk-error-message" role="alert">
      The security check is unavailable. Please reload the page and try again.
    </p>}
  </div>;
}
