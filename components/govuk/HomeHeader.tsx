'use client';

import Link from "next/link";
import Image from "next/image";

export default function GovUKHomeHeader() {
  return (
    <header 
      className="govuk-header" 
      role="banner" 
      data-module="govuk-header"
      style={{ 
        backgroundColor: '#002147', // Compliant custom background meeting WCAG AA standards
        borderBottom: '10px solid #ffbf47', // Standard high-contrast structural ribbon accent rule
        padding: '0',
        margin: '0',
        position: 'relative',
        zIndex: 100,
        clear: 'both'
      }}
    >
      <div 
        className="govuk-header__container govuk-width-container" 
        style={{ 
          paddingTop: '15px',
          paddingBottom: '15px',
          margin: '0 auto',
          display: 'block',
          height: 'auto',
          minHeight: '44px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side Brand Branding Block */}
        <div 
          className="govuk-header__logo" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            float: 'left',
            margin: '0',
            padding: '0'
          }}
        >
          <Link 
            href="/" 
            className="govuk-header__link govuk-header__link--homepage" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              textDecoration: 'none' 
            }}
          >
            <Image 
              src="/logo.png" 
              alt="" // Decorative flag icon element gets an empty screen-reader string parameter
              width={36} 
              height={36} 
              priority
              style={{ marginRight: '12px', display: 'block' }}
            />
            <span 
              className="govuk-header__logotype-text" 
              style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#ffffff', 
                letterSpacing: '-0.5px', 
                lineHeight: '1.2' 
              }}
            >
              CitizenGuide.KE
            </span>
          </Link>
        </div>

        {/* Pure CSS Clearfix wrapper to secure container height calculations on mobile viewports */}
        <div style={{ clear: 'both', display: 'block', height: '0', overflow: 'hidden' }}></div>
      </div>
    </header>
  );
}
