"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import Script from "next/script";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createSupportIntent } from "./actions";

export default function SupportPage() {
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");
  const [selectedTier, setSelectedTier] = useState<string>("500");
  const [customAmount, setCustomAmount] = useState<string>("");
  
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] = useState<{ success?: boolean; error?: string; checkoutUrl?: string } | null>(null);

  // Automatically reset the default tier when switching currency types
  useEffect(() => {
    setSelectedTier(currency === "KES" ? "500" : "10");
    setCustomAmount("");
  }, [currency]);

  return (
    <>
      {/* Turnstile script loaded once globally in ClientLayoutWrapper to prevent duplicate loads */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Support our project", href: "/support" },
        ]}
      />

      <div className="govuk-grid-row govuk-!-margin-top-4">
        <div className="govuk-grid-column-two-thirds">
          
          {submissionState?.error && (
            <div className="govuk-error-summary" role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body govuk-!-text-colour-red">{submissionState.error}</p>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-xl">Support CitizenGuide.KE</h1>
          
          <p className="govuk-body-l">
            Help us maintain an open-access platform for Kenyan civic and government information without paywalls or advertisements.
          </p>

          {/* GOV.UK Technical & Legal Disclosure Box */}
          <div className="govuk-inset-text">
            <h3 className="govuk-heading-s govuk-!-margin-top-0">Important legal information</h3>
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              CitizenGuide.KE is an independent platform managed by a private entity. 
              We are <strong>not</strong> a charitable organization or a public benefit organization.
            </p>
            <p className="govuk-body-s govuk-!-margin-bottom-0">
              Financial contributions are voluntary, used strictly to offset server, operational, and open data maintenance costs. 
              Contributions are <strong>not tax-deductible</strong> and do not grant equity, voting rights, or business ownership into the entity.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} noValidate>
            
            {/* Currency Radio Toggle Tiers */}
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                  Select your preferred currency
                </legend>
                <div className="govuk-radios govuk-radios--inline">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="currency-kes"
                      name="currency"
                      type="radio"
                      checked={currency === "KES"}
                      onChange={() => setCurrency("KES")}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="currency-kes">
                      Kenyan Shilling (KES)
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="currency-usd"
                      name="currency"
                      type="radio"
                      checked={currency === "USD"}
                      onChange={() => setCurrency("USD")}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="currency-usd">
                      US Dollar (USD)
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Support Amounts Tier Layout Frame */}
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                  Choose a support tier
                </legend>
                <div className="govuk-radios">
                  
                  {currency === "KES" ? (
                    <>
                      <div className="govuk-radios__item">
                        <input className="govuk-radios__input" id="tier-1" name="support_tier" type="radio" value="500" checked={selectedTier === "500"} onChange={(e) => setSelectedTier(e.target.value)} />
                        <label className="govuk-label govuk-radios__label" htmlFor="tier-1"><strong>KES 500</strong> – Supports daily server maintenance bandwidth</label>
                      </div>
                      <div className="govuk-radios__item">
                        <input className="govuk-radios__input" id="tier-2" name="support_tier" type="radio" value="1500" checked={selectedTier === "1500"} onChange={(e) => setSelectedTier(e.target.value)} />
                        <label className="govuk-label govuk-radios__label" htmlFor="tier-2"><strong>KES 1,500</strong> – Helps index and parse new county government data sets</label>
                      </div>
                      <div className="govuk-radios__item">
                        <input className="govuk-radios__input" id="tier-3" name="support_tier" type="radio" value="5000" checked={selectedTier === "5000"} onChange={(e) => setSelectedTier(e.target.value)} />
                        <label className="govuk-label govuk-radios__label" htmlFor="tier-3"><strong>KES 5,000</strong> – Keeps the entire service completely ad-free for one month</label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="govuk-radios__item">
                        <input className="govuk-radios__input" id="tier-u1" name="support_tier" type="radio" value="10" checked={selectedTier === "10"} onChange={(e) => setSelectedTier(e.target.value)} />
                        <label className="govuk-label govuk-radios__label" htmlFor="tier-u1"><strong>USD $10</strong> – Contributes to global cloud processing availability</label>
                      </div>
                      <div className="govuk-radios__item">
                        <input className="govuk-radios__input" id="tier-u2" name="support_tier" type="radio" value="25" checked={selectedTier === "25"} onChange={(e) => setSelectedTier(e.target.value)} />
                        <label className="govuk-label govuk-radios__label" htmlFor="tier-u2"><strong>USD $25</strong> – Helps cover edge CDN acceleration caches</label>
                      </div>
                      <div className="govuk-radios__item">
                        <input className="govuk-radios__input" id="tier-u3" name="support_tier" type="radio" value="100" checked={selectedTier === "100"} onChange={(e) => setSelectedTier(e.target.value)} />
                        <label className="govuk-label govuk-radios__label" htmlFor="tier-u3"><strong>USD $100</strong> – Funds major system upgrades for the community framework</label>
                      </div>
                    </>
                  )}

                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="tier-custom" name="support_tier" type="radio" value="custom" checked={selectedTier === "custom"} onChange={(e) => setSelectedTier(e.target.value)} />
                    <label className="govuk-label govuk-radios__label" htmlFor="tier-custom">Enter a custom amount</label>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Custom Amount Form Field Conditional Drawer */}
            {selectedTier === "custom" && (
              <div className="govuk-form-group govuk-!-margin-left-4 govuk-!-padding-left-3 govuk-inset-text">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="custom_amount">
                  Amount ({currency})
                </label>
                <div className="govuk-!-display-flex govuk-!-align-items-center">
                  <span className="govuk-body govuk-!-margin-right-2 govuk-!-font-variant-numeric-tabular">
                    {currency === "KES" ? "KES" : "$"}
                  </span>
                  <input
                    className="govuk-input govuk-input--width-5"
                    id="custom_amount"
                    name="custom_amount"
                    type="number"
                    min="1"
                    step="any"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
              </div>
            )}
            {/* Contact Information Input Sections */}
            <div className="govuk-form-group govuk-!-margin-top-6">
              <label className="govuk-label govuk-label--m" htmlFor="email">
                Email address
              </label>
              <div id="email-support-hint" className="govuk-hint">
                We will send transaction receipts and payment completion verification links here.
              </div>
              <input
                className="govuk-input govuk-!-width-two-thirds"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-describedby="email-support-hint"
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="full_name">
                Full name (optional)
              </label>
              <input
                className="govuk-input govuk-!-width-two-thirds"
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
              />
            </div>

            {/* Anti-Bot Challenge Check Container */}
            <div className="govuk-form-group">
              <div 
                className="cf-turnstile" 
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                data-theme="light"
              ></div>
            </div>

            {/* Submit Actions Layer */}
            <div className="govuk-button-group">
              <button 
                type="submit" 
                disabled={isPending} 
                className="govuk-button"
                onClick={async (e) => {
                  e.preventDefault();
                  setSubmissionState(null);
                  
                  const currentForm = e.currentTarget.form;
                  if (!currentForm) return;

                  // Run standard native visual verification constraints checks
                  if (!currentForm.checkValidity()) {
                    setSubmissionState({ error: "Please provide a valid email address to proceed." });
                    return;
                  }

                  const formData = new FormData(currentForm);
                  const turnstileToken = formData.get("cf-turnstile-response") as string;

                  if (!turnstileToken) {
                    setSubmissionState({ error: "Security check is initializing. Please wait a moment and try again." });
                    return;
                  }

                  // Append dynamic explicit states tracked via React properties
                  formData.append("currency", currency);

                  startTransition(async () => {
                    const result = await createSupportIntent(formData, turnstileToken);
                    if (result.success && result.checkoutUrl) {
                      // Redirect the supporter directly to the secure checkout handler path loop
                      window.location.href = result.checkoutUrl;
                    } else {
                      setSubmissionState({ error: result.error || "An unexpected configuration error occurred." });
                    }
                  });
                }}
              >
                {isPending ? "Processing..." : "Proceed to secure payment"}
              </button>
              
              <Link href="/" className="govuk-button govuk-button--secondary">
                Cancel
              </Link>
            </div>

          </form>

          <p className="govuk-body govuk-!-margin-top-9 govuk-!-text-colour-secondary">
            Thank you for considering supporting the ongoing maintenance of CitizenGuide.KE. 
            Your support helps maintain open access to public regulatory frameworks for all Kenyans.
          </p>

        </div>
      </div>
    </>
  );
}
