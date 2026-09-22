// components/govuk/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ANALYTICS_CONSENT_EVENT } from '@/components/analytics/GoogleAnalytics';

type ConsentStatus = 'hidden' | 'unanswered' | 'accepted-message' | 'rejected-message';

/**
 * GOV.UK Cookie banner — markup aligned with the Design System component.
 * @see https://design-system.service.gov.uk/components/cookie-banner/
 */
export default function CookieBanner() {
  const [consentStatus, setConsentStatus] =
    useState<ConsentStatus>('unanswered');

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent === 'accepted' || savedConsent === 'rejected') {
      const frame = requestAnimationFrame(() => setConsentStatus('hidden'));
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
    setConsentStatus('accepted-message');
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
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
