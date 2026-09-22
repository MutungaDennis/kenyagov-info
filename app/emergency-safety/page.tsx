// app/emergency-and-safety/page.tsx

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Emergency and safety information",
  description:
    "Emergency numbers and official sources of help in Kenya, including police, ambulance, fire, protection services, disasters, wildlife, cyber incidents and reporting wrongdoing.",
};

function PhoneLink({
  href,
  children,
  label,
  inverse = false,
}: {
  href: string;
  children: ReactNode;
  label?: string;
  inverse?: boolean;
}) {
  return (
    <a
      className={`govuk-link${inverse ? " govuk-link--inverse" : ""}`}
      href={`tel:${href}`}
    >
      {label ? <span className="govuk-visually-hidden">{label} </span> : null}
      {children}
    </a>
  );
}

function WhatsAppLink({
  href,
  children,
  label,
}: {
  href: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <a className="govuk-link" href={`https://wa.me/${href}`}>
      {label ? <span className="govuk-visually-hidden">{label} </span> : null}
      {children}
    </a>
  );
}

function ContactRow({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{name}</dt>
      <dd className="govuk-summary-list__value">{children}</dd>
    </div>
  );
}

function ContactGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="govuk-!-margin-bottom-8">
      <h3 className="govuk-heading-m">{title}</h3>
      <dl className="govuk-summary-list">{children}</dl>
    </section>
  );
}

export default function EmergencyAndSafetyPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
          { text: "Emergency and safety" },
        ]}
        title="Emergency and safety information"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text govuk-!-margin-bottom-5">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              CitizenGuide.KE is not an emergency service and cannot dispatch
              police, ambulances, firefighters or other emergency responders.
            </strong>
          </div>

          <section aria-labelledby="police-emergency-heading">
            <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6">
              <h2 className="govuk-panel__title" id="police-emergency-heading">
                Police emergency
              </h2>
              <div className="govuk-panel__body">
                Call{" "}
                <PhoneLink href="999" label="Call police emergency on" inverse>
                  <strong>999</strong>
                </PhoneLink>
                ,{" "}
                <PhoneLink href="112" label="Call police emergency on" inverse>
                  <strong>112</strong>
                </PhoneLink>{" "}
                or{" "}
                <PhoneLink href="911" label="Call police emergency on" inverse>
                  <strong>911</strong>
                </PhoneLink>
              </div>
            </div>
          </section>

          <h2 className="govuk-heading-l">Emergency and support contacts</h2>
          <p className="govuk-body">
            Start with the first section for immediate emergencies. Other
            contacts are grouped by the type of help or report you need. On a
            mobile phone, tap a telephone number to call it. Where WhatsApp is
            listed, tap the number to open WhatsApp.
          </p>

          <ContactGroup title="Immediate emergency response and medical help">
            <ContactRow name="Police emergency">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="999" label="Call police emergency on">
                  <strong>999</strong>
                </PhoneLink>
                ,{" "}
                <PhoneLink href="112" label="Call police emergency on">
                  <strong>112</strong>
                </PhoneLink>{" "}
                or{" "}
                <PhoneLink href="911" label="Call police emergency on">
                  <strong>911</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For an immediate threat to life or safety, a crime happening
                now, serious road crashes and other urgent police assistance.
              </p>
            </ContactRow>

            <ContactRow name="National ambulance dispatch">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="922" label="Call national ambulance dispatch on">
                  <strong>922</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                SHA 922 Lifeline and National Ambulance Dispatch Centre,
                coordinating emergency medical response across all 47 counties.
              </p>
            </ContactRow>

            <ContactRow name="Kenya Red Cross">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="1199" label="Call Kenya Red Cross on">
                  <strong>1199</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Toll-free emergency and humanitarian support line.
              </p>
            </ContactRow>

            <ContactRow name="St John Ambulance Kenya">
              <p className="govuk-body govuk-!-margin-bottom-1">
                24/7 ambulance:{" "}
                <PhoneLink href="0721611555" label="Call St John Ambulance on">
                  <strong>0721 611 555</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Emergency ambulance response and professional pre-hospital care.
                St John advises callers to use this national hotline for
                emergencies rather than waiting for a regional office response.
              </p>
            </ContactRow>

            <ContactRow name="AMREF Flying Doctors">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Emergency control centre:{" "}
                <PhoneLink href="+254206992222" label="Call AMREF Flying Doctors on">
                  <strong>+254 20 699 2222</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                Mobile:{" "}
                <PhoneLink href="+254730811811" label="Call AMREF Flying Doctors on">
                  <strong>+254 730 811 811</strong>
                </PhoneLink>{" "}
                or{" "}
                <PhoneLink href="+254709962811" label="Call AMREF Flying Doctors on">
                  <strong>+254 709 962 811</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Aero-medical evacuation and emergency medical transport. Charges
                or membership conditions may apply depending on the service.
              </p>
            </ContactRow>
          </ContactGroup>

          <ContactGroup title="Safety, protection and crime">
            <ContactRow name="Gender-based violence">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="1195" label="Call the gender-based violence helpline on">
                  <strong>1195</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                National toll-free gender-based violence helpline.
              </p>
            </ContactRow>

            <ContactRow name="Child protection">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="116" label="Call Child Helpline Kenya on">
                  <strong>116</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                WhatsApp:{" "}
                <WhatsAppLink href="254722116116" label="Open Child Helpline Kenya WhatsApp at">
                  <strong>0722 116 116</strong>
                </WhatsAppLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Free 24-hour national service for abuse, neglect, exploitation,
                trafficking, missing children and other child-protection concerns.
              </p>
            </ContactRow>

            <ContactRow name="Directorate of Criminal Investigations (DCI)">
              <p className="govuk-body govuk-!-margin-bottom-1">
                #FichuaKwaDCI:{" "}
                <PhoneLink href="0800722203" label="Call DCI on">
                  <strong>0800 722 203</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                WhatsApp:{" "}
                <WhatsAppLink href="254709570000" label="Open DCI WhatsApp at">
                  <strong>0709 570 000</strong>
                </WhatsAppLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For reporting crimes or sharing intelligence with DCI. DCI states
                that calls to the Fichua line are anonymous.
              </p>
            </ContactRow>

            <ContactRow name="Counter-trafficking in persons">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="0733721566" label="Call the Counter Trafficking in Persons Secretariat on">
                  <strong>0733 721 566</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Government contact published by the State Department for Children
                Services for trafficking concerns.
              </p>
            </ContactRow>
          </ContactGroup>

          <ContactGroup title="Fire, disasters and county emergency contacts">
            <ContactRow name="National Disaster Operations Centre (NDOC)">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="0800721571" label="Call the National Disaster Operations Centre on">
                  <strong>0800 721 571</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                National coordination contact for major disasters and emergency
                operations.
              </p>
            </ContactRow>

            <ContactRow name="Mombasa County Fire and Rescue">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Toll-free fire and rescue:{" "}
                <PhoneLink href="1599" label="Call Mombasa County Fire and Rescue on">
                  <strong>1599</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                County emergency contacts:{" "}
                <PhoneLink href="0707911911"><strong>0707 911 911</strong></PhoneLink>,{" "}
                <PhoneLink href="0788911911"><strong>0788 911 911</strong></PhoneLink>,{" "}
                <PhoneLink href="0775911911"><strong>0775 911 911</strong></PhoneLink>{" "}
                or{" "}
                <PhoneLink href="0756911911"><strong>0756 911 911</strong></PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Numbers currently published by the County Government of Mombasa.
              </p>
            </ContactRow>

            <ContactRow name="Kisumu County emergency and health line">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="0800720575" label="Call Kisumu County on">
                  <strong>0800 720 575</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Kisumu County toll-free line published for health-related issues,
                ambulatory services, public-health emergencies and disasters.
              </p>
            </ContactRow>
          </ContactGroup>

          <div className="govuk-inset-text">
            County fire and rescue arrangements differ. Where CitizenGuide.KE has
            not been able to verify a current dedicated county fire number from an
            official county source, use 999, 112 or 911 for immediate danger and
            follow the relevant county government's current emergency guidance.
          </div>

          <ContactGroup title="Wildlife, environmental and water emergencies">
            <ContactRow name="Kenya Wildlife Service (KWS)">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Toll-free:{" "}
                <PhoneLink href="0800597000" label="Call Kenya Wildlife Service on">
                  <strong>0800 597 000</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For human-wildlife conflict, wildlife-related incidents, wildlife
                crime and urgent incidents in or around protected areas.
              </p>
            </ContactRow>

            <ContactRow name="National Environment Management Authority (NEMA)">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Environmental incident lines:{" "}
                <PhoneLink href="0786101100"><strong>0786 101 100</strong></PhoneLink>{" "}
                or{" "}
                <PhoneLink href="0741101100"><strong>0741 101 100</strong></PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                Email:{" "}
                <a className="govuk-link" href="mailto:incidence@nema.go.ke">
                  incidence@nema.go.ke
                </a>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For pollution, environmental hazards, illegal dumping and other
                environmental incidents or complaints.
              </p>
            </ContactRow>

            <ContactRow name="Maritime and inland-water search and rescue">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Kenya Maritime Authority RMRCC:{" "}
                <PhoneLink href="0721368313"><strong>0721 368 313</strong></PhoneLink>,{" "}
                <PhoneLink href="0737719414"><strong>0737 719 414</strong></PhoneLink>{" "}
                or{" "}
                <PhoneLink href="0208007776"><strong>020 800 7776</strong></PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                24-hour search-and-rescue coordination for distress at sea and on
                Kenya's inland waters.
              </p>
            </ContactRow>
          </ContactGroup>

          <ContactGroup title="Cyber, aviation and other specialist incident reporting">
            <ContactRow name="National KE-CIRT/CC">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="+254703042700" label="Call KE-CIRT on">
                  <strong>+254 703 042 700</strong>
                </PhoneLink>{" "}
                or{" "}
                <PhoneLink href="+254730172700" label="Call KE-CIRT on">
                  <strong>+254 730 172 700</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                Email:{" "}
                <a className="govuk-link" href="mailto:incidents@ke-cirt.go.ke">
                  incidents@ke-cirt.go.ke
                </a>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For cyber-security incidents, attacks and related technical
                incident reporting.
              </p>
            </ContactRow>

            <ContactRow name="Aviation emergency, accident or rescue reporting">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Kenya Civil Aviation Authority:{" "}
                <PhoneLink href="0800720030"><strong>0800 720 030</strong></PhoneLink>{" "}
                or{" "}
                <PhoneLink href="08002215432"><strong>0800 221 5432</strong></PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Toll-free lines published by KCAA for aviation emergencies, air
                accidents and rescue aid.
              </p>
            </ContactRow>

            <ContactRow name="Aviation security incident">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Call{" "}
                <PhoneLink href="0800721418" label="Call KCAA aviation security reporting on">
                  <strong>0800 721 418</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For aviation security-related incidents reported to KCAA.
              </p>
            </ContactRow>
          </ContactGroup>

          <ContactGroup title="Report corruption, misconduct or serious wrongdoing">
            <ContactRow name="Ethics and Anti-Corruption Commission (EACC)">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Toll-free:{" "}
                <PhoneLink href="1551" label="Call EACC on">
                  <strong>1551</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                Report Centre:{" "}
                <PhoneLink href="0202717468"><strong>020 271 7468</strong></PhoneLink>{" "}
                ·{" "}
                <PhoneLink href="0715007700"><strong>0715 007 700</strong></PhoneLink>{" "}
                ·{" "}
                <PhoneLink href="0783777700"><strong>0783 777 700</strong></PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                Email:{" "}
                <a className="govuk-link" href="mailto:report@integrity.go.ke">
                  report@integrity.go.ke
                </a>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For bribery and corruption reports. EACC also provides an
                anonymous whistleblower reporting system online.
              </p>
            </ContactRow>

            <ContactRow name="Independent Policing Oversight Authority (IPOA)">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Toll-free:{" "}
                <PhoneLink href="1559" label="Call IPOA on">
                  <strong>1559</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                Complaints team:{" "}
                <PhoneLink href="+254792532626"><strong>0792 532 626</strong></PhoneLink>{" "}
                or{" "}
                <PhoneLink href="+254773999000"><strong>0773 999 000</strong></PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For complaints about police misconduct. If you are in immediate
                danger, deal with the emergency first using 999, 112 or 911.
              </p>
            </ContactRow>

            <ContactRow name="Witness Protection Agency">
              <p className="govuk-body govuk-!-margin-bottom-1">
                Toll-free:{" "}
                <PhoneLink href="0800720460" label="Call Witness Protection Agency on">
                  <strong>0800 720 460</strong>
                </PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                Hotlines:{" "}
                <PhoneLink href="0711222441"><strong>0711 222 441</strong></PhoneLink>{" "}
                or{" "}
                <PhoneLink href="0725222442"><strong>0725 222 442</strong></PhoneLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For witnesses facing risk or intimidation because of cooperation
                with law-enforcement agencies. The Agency does not investigate or
                arrest offenders.
              </p>
            </ContactRow>
          </ContactGroup>

          <div className="govuk-inset-text">
            If there is an immediate physical threat to life or safety, use the
            police emergency numbers first: 999, 112 or 911.
          </div>

          <h2 className="govuk-heading-l">What to do in an emergency</h2>
          <p className="govuk-body">
            If you can do so safely, move away from immediate danger. When you
            contact an emergency service, be ready to say:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>what has happened</li>
            <li>your location</li>
            <li>how many people are affected</li>
            <li>whether anyone is injured</li>
            <li>whether there is an ongoing danger</li>
          </ul>

          <div className="govuk-inset-text">
            Do not put yourself in danger to collect evidence, belongings,
            photographs or video. Your immediate safety comes first.
          </div>

          <h2 className="govuk-heading-l">More help and official information</h2>

          <details className="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Reporting a crime when there is no immediate danger
              </span>
            </summary>
            <div className="govuk-details__text">
              <p className="govuk-body">
                You can report a crime at a police station. Give the police as
                much accurate information as you can and keep any records or
                reference details relating to the report.
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                <Link href="/topics/crime-justice" className="govuk-link">
                  Crime, justice and the law
                </Link>
              </p>
            </div>
          </details>

          <details className="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Fire, floods, severe weather and disasters
              </span>
            </summary>
            <div className="govuk-details__text">
              <p className="govuk-body">
                Leave an unsafe area if you can do so safely. Do not re-enter a
                burning or unsafe building to retrieve possessions. Do not walk
                or drive through floodwater when you do not know its depth,
                strength or the condition of the road underneath.
              </p>
              <p className="govuk-body govuk-!-margin-bottom-1">
                <ExternalLink href="https://meteo.go.ke/">
                  Kenya Meteorological Department
                </ExternalLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                <ExternalLink href="https://www.ndoc.go.ke/">
                  National Disaster Operations Centre
                </ExternalLink>
              </p>
            </div>
          </details>

          <details className="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Cybercrime, phishing and fake websites
              </span>
            </summary>
            <div className="govuk-details__text">
              <p className="govuk-body">
                If an online incident involves an immediate physical threat,
                threats of violence or another urgent crime, contact the police.
              </p>
              <p className="govuk-body">
                <ExternalLink href="https://ke-cirt.go.ke/report-an-incident/">
                  Report a cyber-security incident to KE-CIRT/CC
                </ExternalLink>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                <Link href="/scams" className="govuk-link">
                  Scams and fake websites
                </Link>
              </p>
            </div>
          </details>

          <details className="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Check emergency information before sharing it
              </span>
            </summary>
            <div className="govuk-details__text">
              <p className="govuk-body govuk-!-margin-bottom-0">
                During a major incident, check which organisation issued a
                message, when it was published and whether the location applies
                to you. Compare it with current information from the responsible
                public authority before forwarding it.
              </p>
            </div>
          </details>

          <h2 className="govuk-heading-l">Official sources</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li><ExternalLink href="https://www.nationalpolice.go.ke/">National Police Service</ExternalLink></li>
            <li><ExternalLink href="https://www.health.go.ke/">Ministry of Health</ExternalLink></li>
            <li><ExternalLink href="https://www.redcross.or.ke/">Kenya Red Cross Society</ExternalLink></li>
            <li><ExternalLink href="https://www.stjohnkenya.org/">St John Ambulance Kenya</ExternalLink></li>
            <li><ExternalLink href="https://flydoc.org/">AMREF Flying Doctors</ExternalLink></li>
            <li><ExternalLink href="https://www.dci.go.ke/">Directorate of Criminal Investigations</ExternalLink></li>
            <li><ExternalLink href="https://childrenservices.go.ke/">State Department for Children Services</ExternalLink></li>
            <li><ExternalLink href="https://www.gender.go.ke/">State Department responsible for gender</ExternalLink></li>
            <li><ExternalLink href="https://www.ndoc.go.ke/">National Disaster Operations Centre</ExternalLink></li>
            <li><ExternalLink href="https://kws.go.ke/">Kenya Wildlife Service</ExternalLink></li>
            <li><ExternalLink href="https://nema.go.ke/">National Environment Management Authority</ExternalLink></li>
            <li><ExternalLink href="https://kma.go.ke/">Kenya Maritime Authority</ExternalLink></li>
            <li><ExternalLink href="https://www.kcaa.or.ke/">Kenya Civil Aviation Authority</ExternalLink></li>
            <li><ExternalLink href="https://ke-cirt.go.ke/">National KE-CIRT/CC</ExternalLink></li>
            <li><ExternalLink href="https://eacc.go.ke/">Ethics and Anti-Corruption Commission</ExternalLink></li>
            <li><ExternalLink href="https://www.ipoa.go.ke/">Independent Policing Oversight Authority</ExternalLink></li>
            <li><ExternalLink href="https://wpa.go.ke/">Witness Protection Agency</ExternalLink></li>
          </ul>

          <h2 className="govuk-heading-l">About this information</h2>
          <p className="govuk-body">
            CitizenGuide.KE lists emergency and reporting contacts to help people
            find the appropriate official or recognised service. We do not
            operate any of the numbers or services on this page.
          </p>
          <p className="govuk-body">
            Emergency numbers and public-service arrangements can change. We
            review this page periodically and link to official sources where
            practical. If a number or official link appears to be incorrect,{" "}
            <Link href="/contact" className="govuk-link">
              tell us
            </Link>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 11 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Crime, justice and the law", href: "/topics/crime-justice" },
            { text: "Health and social care", href: "/topics/health" },
            { text: "Scams and fake websites", href: "/scams" },
            { text: "Contact government", href: "/contact-government" },
            { text: "Complain about government", href: "/complain-about-government" },
            { text: "Help and support", href: "/help" },
          ]}
        />
      </div>
    </>
  );
}