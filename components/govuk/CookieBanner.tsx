// components/govuk/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [consentStatus, setConsentStatus] = useState<string | null>('hidden');

  useEffect(() => {
    // Check if user has already made a selection
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent === 'accepted') {
      // Update consent immediately for GA4 (GOV.UK pattern)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted',
          'analytics_storage': 'granted'
        });
      }
      setConsentStatus('hidden'); // Don't show banner if previously accepted
    } else if (!savedConsent) {
      setConsentStatus('unanswered');
    } else if (savedConsent === 'rejected') {
      setConsentStatus('hidden');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsentStatus('accepted-message');

    // Dynamically update Google Analytics consent states
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setConsentStatus('rejected-message');
    // Keeps state as denied (no code action needed since default is denied)
  };

  const handleHideMessage = () => {
    setConsentStatus('hidden');
  };

  if (consentStatus === 'hidden') return null;

  return (
    <div 
      className="govuk-cookie-banner cookie-banner-style"
      data-nosnippet 
      role="region" 
      aria-label="Cookies on Citizen Guide Kenya"
    >
      <div className="govuk-width-container">
        
        {/* Main Banner Question */}
        {consentStatus === 'unanswered' && (
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m govuk-!-margin-top-0">
                Cookies on Citizen Guide Kenya
              </h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">
                  We use cookies to collect information about how you use our site. We use this information 
                  to make the website work as well as possible and improve our informational services for citizens.
                </p>
              </div>
              <div className="govuk-button-group govuk-!-display-flex govuk-!-gap-3 govuk-!-margin-top-4">
                <button 
                  type="button" 
                  className="govuk-button cookie-accept-btn"
                  onClick={handleAccept}
                >
                  Accept analytics cookies
                </button>
                <button 
                  type="button" 
                  className="govuk-button cookie-reject-btn"
                  onClick={handleReject}
                >
                  Reject analytics cookies
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accepted Confirmation View */}
        {consentStatus === 'accepted-message' && (
          <div className="govuk-cookie-banner__message govuk-width-container">
            <p className="govuk-body">
              You’ve accepted analytics cookies. You can change your cookie settings at any time.
            </p>
            <button 
              type="button" 
              className="govuk-link" 
              onClick={handleHideMessage}
              style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', color: '#1d70b8', cursor: 'pointer' }}
            >
              Hide cookie message
            </button>
          </div>
        )}

        {/* Rejected Confirmation View */}
        {consentStatus === 'rejected-message' && (
          <div className="govuk-cookie-banner__message govuk-width-container">
            <p className="govuk-body">
              You’ve rejected analytics cookies. You can change your cookie settings at any time.
            </p>
            <button 
              type="button" 
              className="govuk-link" 
              onClick={handleHideMessage}
              style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', color: '#1d70b8', cursor: 'pointer' }}
            >
              Hide cookie message
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
