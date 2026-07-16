// components/govuk/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentStatus = 'hidden' | 'unanswered' | 'accepted-message' | 'rejected-message';

function updateAnalyticsConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  });
}

/**
 * GOV.UK Cookie banner — markup aligned with the Design System component.
 * @see https://design-system.service.gov.uk/components/cookie-banner/
 */
export default function CookieBanner() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('hidden');

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent === 'accepted') {
      updateAnalyticsConsent(true);
      setConsentStatus('hidden');
    } else if (savedConsent === 'rejected') {
      setConsentStatus('hidden');
    } else if (!savedConsent) {
      setConsentStatus('unanswered');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    updateAnalyticsConsent(true);
    setConsentStatus('accepted-message');
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    updateAnalyticsConsent(false);
    setConsentStatus('rejected-message');
  };

  const handleHideMessage = () => {
    setConsentStatus('hidden');
  };

  if (consentStatus === 'hidden') return null;

  return (
    <div
      className="govuk-cookie-banner govuk-!-display-none-print"
      data-nosnippet
      role="region"
      aria-label="Cookies on CitizenGuide.KE"
    >
      {consentStatus === 'unanswered' && (
        <div className="govuk-cookie-banner__message govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">
                Cookies on CitizenGuide.KE
              </h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">
                  We use some essential cookies to make this website work.
                </p>
                <p className="govuk-body">
                  We&apos;d also like to use analytics cookies so we can understand
                  how you use the site and make improvements.
                </p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleAccept}
            >
              Accept analytics cookies
            </button>
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleReject}
            >
              Reject analytics cookies
            </button>
            <Link className="govuk-link" href="/cookies">
              View cookies
            </Link>
          </div>
        </div>
      )}

      {consentStatus === 'accepted-message' && (
        <div
          className="govuk-cookie-banner__message govuk-width-container"
          role="alert"
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">
                  You&apos;ve accepted analytics cookies. You can{' '}
                  <Link className="govuk-link" href="/cookies">
                    change your cookie settings
                  </Link>{' '}
                  at any time.
                </p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleHideMessage}
            >
              Hide cookie message
            </button>
          </div>
        </div>
      )}

      {consentStatus === 'rejected-message' && (
        <div
          className="govuk-cookie-banner__message govuk-width-container"
          role="alert"
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">
                  You&apos;ve rejected analytics cookies. You can{' '}
                  <Link className="govuk-link" href="/cookies">
                    change your cookie settings
                  </Link>{' '}
                  at any time.
                </p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleHideMessage}
            >
              Hide cookie message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
