"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const MEASUREMENT_ID = "G-GG9GWN5J48";
export const ANALYTICS_CONSENT_EVENT = "citizenguide:analytics-consent";

export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setEnabled(localStorage.getItem("cookie-consent") === "accepted");
    };

    syncConsent();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
    return () =>
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
