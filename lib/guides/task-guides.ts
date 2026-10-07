export type GuideLink = { text: string; href: string; external?: boolean };

export type TaskGuide = {
  slug: string;
  title: string;
  description: string;
  lead: string;
  before: string[];
  steps: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
  warning?: string;
  official: GuideLink[];
  related: GuideLink[];
  updated: string;
};

const UPDATED = "7 October 2026";
const NOTE =
  "Fees, forms and requirements change. Always confirm on the official website or at the office before you travel or pay.";

export const taskGuides: TaskGuide[] = [
  {
    slug: "get-a-kra-pin",
    title: "Get a KRA PIN",
    description:
      "How to register for a Personal Identification Number (PIN) with the Kenya Revenue Authority on iTax, and what you can use it for.",
    lead: "A KRA PIN is your tax number. You need one to be employed, file tax returns, open many bank accounts, register a business and complete some land and vehicle transactions.",
    before: [
      "your national ID number (or passport number if you are not a citizen)",
      "an email address you can access",
      "a mobile phone number registered in your name",
    ],
    steps: [
      {
        heading: "Register on iTax",
        paragraphs: [
          "Go to the Kenya Revenue Authority iTax portal and choose to register as a taxpayer. Enter your ID number and follow the prompts. You are sent your details by email.",
        ],
      },
      {
        heading: "Download your PIN certificate",
        paragraphs: [
          "When registration is complete you can download your PIN certificate from iTax. Keep a copy: employers, banks and other organisations may ask for it.",
        ],
      },
      {
        heading: "File a return every year",
        paragraphs: [
          "Having a PIN means you are expected to file an annual income tax return, even if you owe nothing. The deadline is normally 30 June for the previous calendar year. A nil return is still a return.",
        ],
      },
    ],
    warning:
      "Registering for a KRA PIN is free. Do not pay agents or people online who promise to get one faster.",
    official: [
      { text: "Kenya Revenue Authority", href: "https://www.kra.go.ke", external: true },
      { text: "iTax portal", href: "https://itax.kra.go.ke", external: true },
    ],
    related: [
      { text: "Money and tax services", href: "/services/categories/money-tax" },
      { text: "How public money works", href: "/how-public-money-works" },
      { text: "eCitizen", href: "/ecitizen" },
    ],
    updated: UPDATED,
  },
  {
    slug: "register-with-sha",
    title: "Register for the Social Health Authority (SHA)",
    description:
      "How to register with the Social Health Authority for public health cover in Kenya, and where to get help.",
    lead: "The Social Health Authority (SHA) runs Kenya's public health insurance. Registering lets you use SHA-covered services at accredited health facilities once your contributions are up to date.",
    before: [
      "your national ID number (or birth certificate or Maisha Namba details for a child)",
      "a mobile phone number you can receive messages on",
      "details of your dependants, if you are registering a household",
    ],
    steps: [
      {
        heading: "Register",
        paragraphs: ["You can usually register in one of these ways:"],
        bullets: [
          "online, through the official SHA website",
          "by phone, using the official SHA USSD code",
          "in person at a Huduma Centre or an SHA office",
        ],
      },
      {
        heading: "Add your dependants",
        paragraphs: [
          "Add your spouse and children so that they are covered. Each person needs the correct identification details.",
        ],
      },
      {
        heading: "Pay your contributions",
        paragraphs: [
          "How much you pay depends on how you earn a living. Employees are normally deducted through payroll. People who are self-employed or in informal work pay on their own. Some households are supported by government if they cannot afford to pay.",
        ],
      },
      {
        heading: "Check that you are active",
        paragraphs: [
          "Before you go to hospital, check that your cover is active using the official SHA channels.",
        ],
      },
    ],
    warning:
      "Only use the official SHA website, USSD code and offices. Do not send money to personal mobile numbers.",
    official: [
      { text: "Social Health Authority", href: "https://sha.go.ke", external: true },
      { text: "Ministry of Health", href: "https://www.health.go.ke", external: true },
    ],
    related: [
      { text: "Huduma Centres", href: "/huduma-centres" },
      { text: "Having a baby", href: "/guides/having-a-baby" },
      { text: "Report a scam", href: "/scams" },
    ],
    updated: UPDATED,
  },
  {
    slug: "register-as-a-voter",
    title: "Register as a voter",
    description:
      "Who can register to vote in Kenya, where to register with the IEBC, and how to check or change your registration.",
    lead: "You can vote only if you are registered. The Independent Electoral and Boundaries Commission (IEBC) keeps the register of voters.",
    before: [
      "to be a Kenyan citizen aged 18 or over",
      "your original national ID card or valid Kenyan passport",
    ],
    steps: [
      {
        heading: "Register",
        paragraphs: [
          "Visit an IEBC registration centre or your constituency IEBC office. Your details and fingerprints are taken and you are given an acknowledgement slip. Keep it.",
          "The IEBC announces registration periods and centres before an election. Outside those periods you can ask your constituency office what is available.",
        ],
      },
      {
        heading: "Check your details",
        paragraphs: [
          "After registering, check that you are on the register, and where you will vote. Mistakes in your name or polling station are easier to correct early.",
        ],
      },
      {
        heading: "Change your polling station",
        paragraphs: [
          "If you move, you can ask the IEBC to transfer your registration to a new polling station. There are deadlines before each election.",
        ],
      },
    ],
    official: [
      { text: "Independent Electoral and Boundaries Commission", href: "https://www.iebc.or.ke", external: true },
    ],
    related: [
      { text: "Voter registration", href: "/elections/voter-registration" },
      { text: "Polling stations", href: "/elections/polling-stations" },
      { text: "IEBC offices", href: "/elections/iebc-offices" },
      { text: "2027 General Election timeline", href: "/elections/general-elections/timeline" },
    ],
    updated: UPDATED,
  },
  {
    slug: "apply-for-a-passport",
    title: "Apply for a Kenyan passport",
    description:
      "The main steps to apply for or renew a Kenyan passport using eCitizen and the Department of Immigration Services.",
    lead: "Kenyan passports are issued by the Department of Immigration Services. You start your application online and then visit an immigration office to give your biometrics.",
    before: [
      "your national ID card (and birth certificate if the office asks for it)",
      "your old passport, if you are renewing",
      "an eCitizen account",
    ],
    steps: [
      {
        heading: "Start on eCitizen",
        paragraphs: [
          "Sign in to eCitizen, choose the immigration passport service and fill in the application. Choose the type of passport that fits your travel.",
        ],
      },
      {
        heading: "Pay the official fee",
        paragraphs: [
          "Pay only through the payment options shown on eCitizen. Keep your payment confirmation.",
        ],
      },
      {
        heading: "Give your biometrics",
        paragraphs: [
          "Book or visit the immigration office you selected with your documents. Your photograph and fingerprints are captured there.",
        ],
      },
      {
        heading: "Collect your passport",
        paragraphs: [
          "You are told how and where to collect your passport. Check the details before you leave the office.",
        ],
      },
    ],
    warning: "Do not pay anyone to speed up your passport. Report anyone who asks for a bribe.",
    official: [
      { text: "eCitizen", href: "https://www.ecitizen.go.ke", external: true },
      { text: "Department of Immigration Services", href: "https://immigration.go.ke", external: true },
    ],
    related: [
      { text: "Passports, travel and living abroad", href: "/services/categories/passports-travel" },
      { text: "eCitizen", href: "/ecitizen" },
      { text: "Huduma Centres", href: "/huduma-centres" },
    ],
    updated: UPDATED,
  },
  {
    slug: "get-a-national-id-card",
    title: "Get a national ID card",
    description:
      "How Kenyan citizens aged 18 or over apply for a national identity card, and what to prepare.",
    lead: "A national ID card is the main proof of identity for Kenyan citizens aged 18 or over. You need it to register as a voter, get a KRA PIN, open a bank account and apply for a passport.",
    before: [
      "your birth certificate",
      "your parents' ID cards or other proof of citizenship, if the office asks for them",
      "a supporting letter from a local chief or assistant chief, if the office asks for one",
    ],
    steps: [
      {
        heading: "Find an office",
        paragraphs: [
          "Applications are made at Huduma Centres and at registration offices of the Department of Immigration Services. Ask which one serves your area.",
        ],
      },
      {
        heading: "Apply in person",
        paragraphs: [
          "Your details, photograph and fingerprints are taken. You get an acknowledgement or waiting card. Keep it safe.",
        ],
      },
      {
        heading: "Collect your ID",
        paragraphs: [
          "You are told where to collect your ID card. Take your acknowledgement and check your details before leaving.",
        ],
      },
    ],
    warning: "ID cards are issued free of charge for a first application. Report anyone who demands a payment.",
    official: [
      { text: "State Department for Immigration and Citizen Services", href: "https://immigration.go.ke", external: true },
    ],
    related: [
      { text: "Huduma Centres", href: "/huduma-centres" },
      { text: "Register as a voter", href: "/guides/register-as-a-voter" },
      { text: "Having a baby", href: "/guides/having-a-baby" },
    ],
    updated: UPDATED,
  },
  {
    slug: "ask-a-public-body-for-information",
    title: "Ask a public body for information",
    description:
      "How to make a request for information to a public body under Article 35 of the Constitution and the Access to Information Act.",
    lead: "Every citizen has the right to information held by the State. You can ask any public body for it, and in some cases private bodies as well.",
    before: [
      "the name of the public body that holds the information",
      "a clear description of the records or facts you want",
    ],
    steps: [
      {
        heading: "Write your request",
        paragraphs: [
          "Write to the head of the public body, or its information officer. Say what information you want, and how you want to receive it, for example by email or as a copy.",
          "You do not have to give a reason for asking.",
        ],
      },
      {
        heading: "Wait for the response",
        paragraphs: [
          "The public body must normally respond within 21 days. It may give you the information, refuse with reasons, or tell you it is held by another body.",
        ],
      },
      {
        heading: "Appeal if you are refused",
        paragraphs: [
          "If you are refused or ignored, you can complain to the Commission on Administrative Justice (the Ombudsman), which handles access to information complaints.",
        ],
      },
    ],
    official: [
      { text: "Commission on Administrative Justice", href: "https://www.ombudsman.go.ke", external: true },
    ],
    related: [
      { text: "Access to information", href: "/access-to-information" },
      { text: "Article 35: Access to information", href: "/constitution/article/35" },
      { text: "Contact government", href: "/contact-government" },
    ],
    updated: UPDATED,
  },
];

export const taskGuideNote = NOTE;

export function getTaskGuide(slug: string): TaskGuide | undefined {
  return taskGuides.find((guide) => guide.slug === slug);
}