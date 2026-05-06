import Link from "next/link";
import Image from "next/image";

export default function GovUKFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <Image 
                src="/logo.png" 
                alt="KenyaGovInfo.KE Logo" 
                width={45} 
                height={45}
              />
              <span className="font-bold text-lg">KenyaGovInfo.KE</span>
            </div>

            {/* Three Columns using GOV.UK Grid */}
            <div className="govuk-grid-row">
              
              {/* Column 1: Explore */}
              <div className="govuk-grid-column-one-third">
                <h2 className="govuk-heading-s mb-3">Explore</h2>
                <ul className="govuk-list govuk-list--spaced text-sm">
                  <li><Link href="/services" className="govuk-footer__link">Services</Link></li>
                  <li><Link href="/executive" className="govuk-footer__link">Executive</Link></li>
                  <li><Link href="/legislature" className="govuk-footer__link">Legislature</Link></li>
                  <li><Link href="/judiciary" className="govuk-footer__link">Judiciary</Link></li>
                  <li><Link href="/counties" className="govuk-footer__link">Counties</Link></li>
                </ul>
              </div>

              {/* Column 2: About this site */}
              <div className="govuk-grid-column-one-third">
                <h2 className="govuk-heading-s mb-3">About this site</h2>
                <ul className="govuk-list govuk-list--spaced text-sm">
                  <li><Link href="/about" className="govuk-footer__link">About KenyaGovInfo.KE</Link></li>
                  <li><Link href="/help" className="govuk-footer__link">Help</Link></li>
                  <li><Link href="/accessibility" className="govuk-footer__link">Accessibility</Link></li>
                  <li><Link href="/contact" className="govuk-footer__link">Contact</Link></li>
                </ul>
              </div>

              {/* Column 3: Legal */}
              <div className="govuk-grid-column-one-third">
                <h2 className="govuk-heading-s mb-3">Legal</h2>
                <ul className="govuk-list govuk-list--spaced text-sm">
                  <li><Link href="/privacy" className="govuk-footer__link">Privacy</Link></li>
                  <li><Link href="/cookies" className="govuk-footer__link">Cookies</Link></li>
                  <li><Link href="/terms" className="govuk-footer__link">Terms and conditions</Link></li>
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="govuk-footer__meta-custom govuk-!-margin-top-10 pt-6 border-t border-gray-200">
              <p className="govuk-footer__meta-text">
                <strong>Disclaimer:</strong> KenyaGovInfo.KE is an independent informational platform and is 
                <strong> not</strong> an official website of the Government of Kenya.
              </p>
              <p className="govuk-footer__meta-text">
                All information is compiled from public sources. For official services, please use the{' '}
                <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link">eCitizen Portal</a>.
              </p>
              <p className="govuk-footer__meta-text">
                © {new Date().getFullYear()} KenyaGovInfo.KE — Not affiliated with or endorsed by the Government of Kenya.
              </p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}