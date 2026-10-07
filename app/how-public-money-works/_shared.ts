import { constitutionRefs } from "@/lib/constitution-links";

export const guideName = "How public money works";
export const guideBase = "/how-public-money-works";
export const lastUpdated = "10 September 2026";

export const sections = [
  { slug: "the-public-money-cycle", title: "The public money cycle", description: "A simplified way to understand public finance is:" },
  { slug: "principles-of-public-finance", title: "Principles of public finance", description: "Article 201 of the Constitution sets principles that apply to public finance in Kenya." },
  { slug: "where-public-money-comes-from", title: "Where public money comes from", description: "Government revenue comes from several sources. Taxes are important, but they are not the only source of public money." },
  { slug: "where-government-money-is-kept", title: "Where government money is kept", description: "The Constitution establishes public funds through which government revenue is managed." },
  { slug: "how-the-national-budget-is-made", title: "How the national budget is made", description: "Kenya's budget is a process, not a single event on Budget Day. Work on the next financial year begins months before Parliament approves the final spending plans." },
  { slug: "appropriation-and-taxation-are-different", title: "Appropriation and taxation are different", description: "Several Bills and Acts appear during a budget cycle. They do different jobs." },
  { slug: "how-counties-get-a-share-of-national-revenue", title: "How counties get a share of national revenue", description: "Revenue raised nationally is shared between the national and county levels of government." },
  { slug: "counties-can-receive-more-than-the-equitable-share", title: "Counties can receive more than the equitable share", description: "The equitable share is not necessarily the only transfer a county receives from the national level." },
  { slug: "how-county-budgets-work", title: "How county budgets work", description: "Each of Kenya's 47 county governments has its own budget process." },
  { slug: "what-recurrent-and-development-spending-mean", title: "What recurrent and development spending mean", description: "Government budgets distinguish between recurrent and development expenditure." },
  { slug: "what-happens-when-revenue-is-not-enough", title: "What happens when revenue is not enough", description: "A government budget can plan to spend more than the revenue expected from taxes and other ordinary sources. The difference is a budget deficit." },
  { slug: "a-budget-is-not-the-same-as-actual-spending", title: "A budget is not the same as actual spending", description: "This distinction is important when reading government figures." },
  { slug: "who-checks-public-spending", title: "Who checks public spending", description: "The Controller of Budget is an independent office established under Article 228 of the Constitution." },
  { slug: "controller-of-budget-and-auditor-general-are-different", title: "Controller of Budget and Auditor-General are different", description: "These offices are sometimes confused, but their roles are not the same." },
  { slug: "supplementary-budgets", title: "Supplementary budgets", description: "An approved annual budget can change during the financial year." },
  { slug: "public-participation-in-budgets", title: "Public participation in budgets", description: "Public participation is not simply a courtesy. Article 201 of the Constitution expressly includes public participation as a principle of public finance." },
  { slug: "how-to-read-a-public-budget", title: "How to read a public budget", description: "When you see a budget figure, ask:" },
  { slug: "where-to-find-official-public-finance-information", title: "Where to find official public finance information", description: "" },
  { slug: "find-public-finance-information-on-citizenguide-ke", title: "Find public finance information on CitizenGuide.KE", description: "" },
  { slug: "legal-framework", title: "Legal framework", description: "This page is a simplified explanation. Kenya's public finance framework is mainly governed by Chapter Twelve of the Constitution, the Public Finance Management Act and other…" },
] as const;

export const relatedLinks = [
    {
      text: "How government works",
      href: "/how-government-works",
    },
    {
      text: "County vs national",
      href: "/county-vs-national",
    },
    {
      text: "Devolution",
      href: "/government/counties/devolution",
    },
    {
      text: "Money and tax",
      href: "/topics/money-tax",
    },
    {
      text: "Access to information",
      href: "/access-to-information",
    },
    {
      text: "Open data",
      href: "/open-data",
    },
    {
      text: constitutionRefs.publicFinance.label,
      href: constitutionRefs.publicFinance.href,
    },
  ];
