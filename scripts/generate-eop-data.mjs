/**
 * One-shot generator: emits lib/data/election-eop.ts from structured EOP rows.
 * Run: node scripts/generate-eop-data.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../lib/data/election-eop.ts");

/**
 * Sections with plain-language summaries for the public page.
 * audienceHint: what kind of reader cares most about this section.
 */
const sections = [
  {
    id: "1",
    title: "Election campaign financing",
    summary:
      "Spending limits, campaign finance regulations, and expenditure reports that parties and candidates must file.",
    publicInterest: true,
  },
  {
    id: "2",
    title: "Nomination",
    summary:
      "Party primaries, independent candidacy steps, and presidential supporter verification before official nomination.",
    publicInterest: true,
  },
  {
    id: "3",
    title: "Registration of candidates",
    summary:
      "When candidates for each office submit nomination papers, dispute resolution, and gazettement of nominees.",
    publicInterest: true,
  },
  {
    id: "4",
    title: "Register of voters",
    summary:
      "Continuous and enhanced voter registration, biometric verification, audit of the register, and certification before election day.",
    publicInterest: true,
  },
  {
    id: "5",
    title: "Party lists",
    summary:
      "Special seat (party list) preparation, certification by the Registrar, publication, and allocation after the poll.",
    publicInterest: true,
  },
  {
    id: "6",
    title: "Agents",
    summary:
      "Deadlines for party and candidate agents and agent training before polling day.",
    publicInterest: true,
  },
  {
    id: "7",
    title: "General election operations",
    summary:
      "Gazettement of the election, returning officers, tallying centres, polling stations, and Election Day.",
    publicInterest: true,
  },
  {
    id: "8",
    title: "General election staff training",
    summary:
      "Recruitment and training of temporary election officials, from national trainers down to polling clerks.",
    publicInterest: false,
  },
  {
    id: "9",
    title: "General election logistics",
    summary:
      "Distribution of materials, ballot printing and packaging, and reverse logistics after the poll.",
    publicInterest: false,
  },
  {
    id: "10",
    title: "Results management",
    summary:
      "Counting at polling stations, tallying, certificates of election, gazettement, and party-list seat allocation.",
    publicInterest: true,
  },
  {
    id: "11",
    title: "Election petitions",
    summary:
      "Filing and determination windows for presidential, parliamentary and county election petitions.",
    publicInterest: true,
  },
  {
    id: "12",
    title: "Voter education and outreach",
    summary:
      "Voter education materials, registration drives, biometric verification education, and outreach to marginalised groups and the diaspora.",
    publicInterest: true,
  },
  {
    id: "13",
    title: "Partnerships and stakeholder engagement",
    summary:
      "Partnerships with agencies, counties, diaspora offices, youth forums and election technical assistance providers.",
    publicInterest: false,
  },
  {
    id: "14",
    title: "Election observation",
    summary:
      "Accreditation of long- and short-term observers, observer kits, briefings and the national election conference.",
    publicInterest: true,
  },
  {
    id: "15",
    title: "Internal and external communications",
    summary:
      "How IEBC plans to communicate with the public, media, and its own staff during the electoral cycle.",
    publicInterest: true,
  },
  {
    id: "16",
    title: "Election risk and security management",
    summary:
      "Risk frameworks, inter-agency security coordination, and training of security officers on electoral security.",
    publicInterest: false,
  },
  {
    id: "17",
    title: "Data protection",
    summary:
      "Data protection framework review, staff training and commission data mapping.",
    publicInterest: false,
  },
  {
    id: "18",
    title: "Internal audit",
    summary:
      "Internal audit framework and regular assurance audits of Commission processes.",
    publicInterest: false,
  },
  {
    id: "19",
    title: "Information communication and technology",
    summary:
      "KIEMS kits, election technology, results transmission network, open day and technical support for the 2027 poll.",
    publicInterest: true,
  },
  {
    id: "20",
    title: "Finance",
    summary:
      "Multi-year budget planning and engagement with the National Treasury, Parliament and development partners for election funding.",
    publicInterest: false,
  },
  {
    id: "21",
    title: "Procurement, warehousing and logistics",
    summary:
      "Procurement plans, stock-taking, disposal of obsolete materials and procurement of election materials and services.",
    publicInterest: false,
  },
  {
    id: "22",
    title: "Research, strategy, planning and development",
    summary:
      "Monitoring and evaluation, research, post-election evaluation and results/observer report compendia.",
    publicInterest: false,
  },
];

/**
 * Activities: [ref, title, startISO|null, endISO|null, durationDays|null, publicInterest]
 * publicInterest true = citizens, candidates, parties, observers should watch this.
 */
const activities = [
  // 1 Campaign financing
  ["1", "Election campaign financing (overall)", "2026-06-16", "2027-11-08", 510, true],
  ["1.1", "Review and conduct public participation on spending limits of political parties and candidates", "2026-06-16", "2026-08-09", 55, true],
  ["1.2", "Publication of Election Campaign Financing Regulations", "2026-06-16", "2026-08-09", 55, true],
  ["1.3", "Enforcement of Campaign Finance Amendment Act/Regulations", "2026-08-09", "2027-11-05", 454, true],
  ["1.4", "Publication of limits for expenditure, contributions and donations", "2026-08-10", "2026-08-10", 1, true],
  ["1.5", "Submission of nomination expenditure reports by political parties and candidates", "2027-03-24", "2027-04-14", 21, true],
  ["1.6", "Submission of general election expenditure returns by political parties and candidates", "2027-08-11", "2027-11-09", 90, true],
  ["1.7", "Submission of names of authorised persons to manage campaign accounts (candidate, agent or Party Expenditure Committee member)", "2026-11-10", "2027-06-10", 213, true],

  // 2 Nomination — party candidates
  ["2.1.1", "Publication of a Gazette Notice on guidelines for political party candidate nomination process", "2026-08-19", "2026-08-19", 1, true],
  ["2.1.2", "Certification of Party Nomination Rules by Registrar of Political Parties", "2026-10-31", "2026-11-06", 7, true],
  ["2.1.3", "Submission of certified party nomination rules to the Commission by political parties", "2026-11-06", "2026-11-12", 7, true],
  ["2.1.4", "Review of certified nomination rules by the Commission", "2026-11-13", "2026-11-26", 14, false],
  ["2.1.5", "Issuance of compliance certificate to compliant political parties", "2026-11-26", "2026-11-26", 1, true],
  ["2.1.6", "Direct non-compliant political parties to comply", "2026-11-26", "2026-11-26", 1, true],
  ["2.1.7", "Submission of amended political party nomination rules for parties directed to comply", "2026-11-27", "2026-12-10", 14, true],
  ["2.1.8", "Issuance of compliance certificate to compliant political parties (amended rules)", "2026-12-10", "2026-12-10", 1, true],
  ["2.1.9", "Submission of political party membership list", "2027-03-16", "2027-03-16", 1, true],
  ["2.1.10", "Publication of the political party membership lists", "2027-03-16", "2027-03-22", 7, true],
  ["2.1.11", "Submission of coalition political party agreement to IEBC", "2027-03-16", "2027-03-16", 1, true],
  ["2.1.12", "Submission of the list of persons participating in party primaries", "2027-03-16", "2027-03-16", 1, true],
  ["2.1.13", "Gazette of the list of persons participating in political party nominations and date of party nomination", "2027-03-17", "2027-03-23", 7, true],
  ["2.1.14", "Political parties to conduct party primaries", "2027-03-17", "2027-04-10", 10, true],
  ["2.1.15", "Hearing and determination of intra-party disputes arising from party nominations", "2027-04-10", "2027-05-09", 30, true],
  ["2.1.16", "Submission of the list of successful persons nominated by political parties (direct/indirect)", "2027-05-10", "2027-05-20", 11, true],
  ["2.1.17", "Submission of the list of successful persons nominated by political parties (closing window)", "2027-05-19", "2027-05-20", 2, true],
  ["2.1.18", "Submission of nomination expenditure reports to the Commission", "2027-04-12", "2027-05-03", 21, true],

  // 2.2 Independents
  ["2.2.1", "Resignation by persons intending to contest as independent candidates from political parties", "2027-05-09", "2027-05-09", null, true],
  ["2.2.2", "Submission of independent candidates’ symbols, intention to contest and clearance certificate", "2027-05-03", "2027-05-09", 7, true],
  ["2.2.3", "Approval of names and symbols of persons intending to vie as independent candidates", "2027-05-10", "2027-05-19", 10, true],
  ["2.2.4", "Gazettement of names and symbols of persons intending to vie as independent candidates", "2027-05-20", "2027-05-21", 2, true],

  // 2.3 Presidential supporters
  ["2.3.1", "Pre-candidate nomination meeting for presidential candidates", "2027-05-22", "2027-05-22", 1, true],
  ["2.3.2", "Collection of supporter booklet/template", "2027-05-22", "2027-05-22", 1, true],
  ["2.3.3", "Collection of supporters for presidential candidate in a majority of the counties", "2027-05-22", "2027-05-28", 7, true],
  ["2.3.4", "Submission of supporters for presidential candidate", "2027-05-29", "2027-05-30", 2, true],
  ["2.3.5", "Verification of supporters for presidential candidate", "2027-05-29", "2027-06-02", 5, true],
  ["2.3.6", "Resubmission of supporters for presidential candidate to comply with top-up requirement", "2027-05-30", "2027-06-03", 5, true],

  // 3 Registration of candidates
  ["3.1", "Sharing of names of proposed Returning Officers and Deputies with political parties and independent candidates", "2027-04-01", "2027-04-14", 14, true],
  ["3.2", "Appointment and gazettement of Returning Officers", "2027-04-28", "2027-04-29", 2, true],
  ["3.3", "Identification and publication of candidate registration venues", "2027-05-03", "2027-05-09", 7, true],
  ["3.4", "Pre-candidate registration meeting", "2027-05-24", "2027-05-27", 4, true],
  ["3.5", "Testing of candidate registration software", "2027-05-27", "2027-05-27", 1, false],
  ["3.6", "Collection of candidate registration documents", "2027-05-24", "2027-05-28", 5, true],
  ["3.7", "Submission of Presidential candidate registration documents", "2027-05-29", "2027-06-11", 14, true],
  ["3.8", "Submission of Member of National Assembly candidate registration documents", "2027-05-29", "2027-06-01", 4, true],
  ["3.9", "Submission of Member of County Assembly candidate registration documents", "2027-06-02", "2027-06-11", 10, true],
  ["3.10", "Submission of Senate candidate registration documents", "2027-05-29", "2027-06-02", 5, true],
  ["3.11", "Submission of County Governor candidate registration documents", "2027-06-03", "2027-06-06", 4, true],
  ["3.12", "Submission of County Woman Member to the National Assembly candidate registration documents", "2027-06-07", "2027-06-11", 5, true],
  ["3.13", "Harmonisation of campaign schedules", "2027-06-12", "2027-06-15", 4, true],
  ["3.14", "Delivery of candidate nomination returns to headquarters for safe custody and gazettement", "2027-06-15", "2027-06-17", 3, false],
  ["3.15", "Dispute resolution arising from registration of candidates", "2027-06-12", "2027-06-21", 10, true],
  ["3.16", "Gazettement of nominated candidates (independent and political party sponsored)", "2027-06-22", "2027-06-28", 7, true],
  ["3.17", "Commission quality assurance on ballot proof and notice to voters", "2027-06-29", "2027-07-12", 14, true],
  ["3.18", "Forwarding of candidates’ names to the ballot paper printing firm", "2027-07-13", "2027-07-19", 7, false],
  ["3.19", "Quality assurance on ballot paper printing, statutory forms, pallet packages and logistics to polling stations", "2027-07-20", "2027-08-09", 21, false],

  // 4 Register of voters
  ["4.1", "Gazettement of resumption of continuous voter registration (CVR)", "2025-09-26", "2025-09-26", 1, true],
  ["4.2", "Gazettement of Registration and Deputy Registration Officers", "2025-09-26", "2025-09-26", 1, true],
  ["4.3", "Continuous voter registration", "2025-09-29", "2027-05-13", 587, true],
  ["4.4", "Inspection by members of the public on the Register of Voters", "2025-09-26", "2027-08-10", 684, true],
  ["4.5", "Gazettement of enhanced continuous voter registration (ECVR I)", "2026-03-27", "2026-03-27", 1, true],
  ["4.6", "Gazettement of registration centres for ECVR I", "2026-03-27", "2026-03-27", 1, true],
  ["4.7", "Conduct of Enhanced Continuous Voter Registration I", "2026-03-30", "2026-04-28", 30, true],
  ["4.8", "Update and upload registration data in the central database", "2025-09-29", "2027-06-12", 590, false],
  ["4.9", "Gazettement of ECVR II", "2026-11-25", "2026-11-25", 1, true],
  ["4.10", "Gazettement of registration centres for ECVR II", "2026-11-25", "2026-11-25", 1, true],
  ["4.11", "Conduct of ECVR II", "2027-01-11", "2027-02-09", 30, true],
  ["4.12", "Engagement of a professional reputable firm to audit the Register of Voters", "2026-12-08", "2027-02-06", 60, false],
  ["4.13", "Audit of the Register of Voters by professional reputable firm", "2027-02-15", "2027-03-16", 30, true],
  ["4.14", "Receiving and responding to the Audit Report on the Register of Voters", "2027-02-15", "2027-03-16", 30, false],
  ["4.15", "Submission of final Audit of the Register of Voters Report to the Commission", "2027-03-23", "2027-03-23", 7, false],
  ["4.16", "Implementation of the recommendations of Audit of the Register of Voters findings", "2027-03-23", "2027-04-06", 15, true],
  ["4.17", "Gazettement of suspension of the registration of voters", "2027-04-26", "2027-04-26", 1, true],
  ["4.18", "Suspension of continuous voter registration", "2027-05-13", "2027-05-13", 1, true],
  ["4.19", "Processing of voter registration claims", "2025-10-06", "2027-05-13", 584, true],
  ["4.20", "Gazettement of availability of the register of voters for biometric verification", "2027-04-26", "2027-04-26", 1, true],
  ["4.21", "Verification of biometric data by members of the public on the Register of Voters at their registration centres", "2027-04-26", "2027-05-25", 30, true],
  ["4.22", "Compilation of the Register of Voters for every polling station, ward, constituency, county and voters residing outside Kenya", "2027-05-25", "2027-06-07", 14, false],
  ["4.23", "Certification of the Register of Voters for gazettement and online publication", "2027-06-07", "2027-06-12", 5, true],

  // 5 Party lists
  ["5.1", "Gazette regulations and guidelines on preparation of party lists", "2027-05-24", "2027-05-30", 7, true],
  ["5.2", "Gazettement and publication (electronic and print) of the formula for allocating seats to political parties", "2027-05-25", "2027-05-31", 7, true],
  ["5.3", "Submission of party lists to the Registrar of Political Parties", "2027-06-06", "2027-06-12", 7, true],
  ["5.4", "Certification of party list by the Registrar of Political Parties", "2027-06-14", "2027-06-20", 7, true],
  ["5.5", "Submission of party lists to the Commission", "2027-06-21", "2027-06-26", 6, true],
  ["5.6", "Review of party lists by the Commission", "2027-06-27", "2027-07-10", 14, false],
  ["5.7", "Issuance of compliance certificates to compliant political parties", "2027-06-27", "2027-07-10", 14, true],
  ["5.8", "Re-submission of party lists for political parties directed to comply", "2027-07-11", "2027-07-17", 7, true],
  ["5.9", "Publication of political party lists", "2027-07-18", "2027-07-24", 7, true],
  ["5.10", "Dispute resolution arising from party lists", "2027-07-25", "2027-08-04", 10, true],
  ["5.11", "Allocation of special seats through party lists", "2027-08-17", "2027-09-15", 30, true],

  // 6 Agents
  ["6.1", "Submission of names of national, county and constituency chief agents", "2027-07-21", "2027-07-27", 7, true],
  ["6.2", "Training of agents", "2027-08-07", "2027-08-07", 1, true],

  // 7 General election
  ["7.1", "Gazettement of General Election", "2027-01-12", "2027-01-12", 1, true],
  ["7.2", "Publication of directives on special voting arrangements", "2027-02-11", "2027-02-11", 1, true],
  ["7.3", "Sharing of names of proposed Returning Officers and Deputies with political parties and independent candidates", "2026-04-02", "2026-04-15", 14, true],
  ["7.4", "Appointment and gazettement of Returning Officers", "2027-04-28", "2027-04-29", 2, true],
  ["7.5", "General Election national planning meeting", "2027-05-02", "2027-05-06", 5, false],
  ["7.6", "Administration of Oath of Secrecy to members of the Commission and General Election staff", "2027-05-06", "2027-05-06", 1, false],
  ["7.7", "Establishment of General Election Constituency Peace Committees", "2027-05-11", "2027-05-12", 2, true],
  ["7.8", "County General Election planning meeting", "2027-05-12", "2027-05-12", 1, false],
  ["7.9", "Constituency General Election planning meeting", "2027-05-12", "2027-05-21", 10, false],
  ["7.10", "Identification of tallying centres (national/county/constituency)", "2027-05-21", "2027-05-27", 7, true],
  ["7.11", "Testing and verification of election technology for the General Election", "2027-06-05", "2027-06-09", 5, true],
  ["7.12", "Gazettement of tallying centres", "2027-06-11", "2027-06-24", 14, true],
  ["7.13", "Identification of polling stations and confirmation of usability", "2027-06-25", "2027-07-04", 10, true],
  ["7.14", "Gazettement of polling stations", "2027-07-04", "2027-07-08", 5, true],
  ["7.15", "Publication of network service providers for purposes of the General Election", "2027-07-18", "2027-07-22", 5, true],
  ["7.16", "Publication of polling stations without network coverage", "2027-07-17", "2027-07-24", 8, true],
  ["7.17", "Display of the register of voters at polling stations", "2027-08-01", "2027-08-03", 4, true],
  ["7.18", "General Election Day", "2027-08-10", "2027-08-10", 1, true],

  // 8 Staff training
  ["8.1", "Review and develop electoral training manuals and materials", "2026-07-07", "2027-05-04", 302, false],
  ["8.2", "Recruitment of temporary election officials (DCRO, DRO, LOs, ICT Assistant, SETs, PO, DPO, Clerks)", "2027-03-29", "2027-06-26", 90, false],
  ["8.3", "Sharing data of successful general election staff with political parties and candidates", "2027-04-29", "2027-07-10", 73, true],
  ["8.4", "General Election electoral training content development", "2027-06-28", "2027-07-04", 7, false],
  ["8.5", "Planning meeting for Training of Trainers at the national level", "2027-07-04", "2027-07-04", 1, false],
  ["8.6", "Training of Trainers at the national level", "2027-07-05", "2027-07-10", 6, false],
  ["8.7", "Planning meetings for cluster training", "2027-07-13", "2027-07-13", 1, false],
  ["8.8", "Training of CROs, DCROs, ROs, DROs, ICT, accountants and SCMA", "2027-07-14", "2027-07-19", 6, false],
  ["8.9", "Planning meeting for SETs training", "2027-07-22", "2027-07-22", 1, false],
  ["8.10", "Training of SETs", "2027-07-23", "2027-07-27", 5, false],
  ["8.11", "Planning meeting for Presiding Officers (PO) and Deputy Presiding Officers (DPO) training", "2027-07-28", "2027-07-28", 1, false],
  ["8.12", "Training of POs and DPOs", "2027-07-29", "2027-08-02", 5, false],
  ["8.13", "Planning meeting for polling clerks training", "2027-08-03", "2027-08-03", 1, false],
  ["8.14", "Training of polling clerks", "2027-08-04", "2027-08-06", 3, false],
  ["8.15", "Assessment of polling stations by POs", "2027-08-08", "2027-08-08", 1, false],
  ["8.16", "Briefing of police officers", "2027-08-09", "2027-08-09", 1, false],
  ["8.17", "Polling staff deployment to respective polling stations", "2027-08-09", "2027-08-09", 1, false],

  // 9 Logistics
  ["9.1", "Distribution of non-strategic materials", "2027-03-01", "2027-07-01", 60, false],
  ["9.2", "Printing and packaging of ballot papers and statutory forms", "2027-07-05", "2027-07-25", 21, false],
  ["9.3", "Receiving and clearing of strategic materials", "2027-07-26", "2027-07-30", 5, false],
  ["9.4", "Distribution of strategic materials", "2027-07-30", "2027-08-08", 10, false],
  ["9.5", "Reverse logistics", "2027-08-11", "2027-08-31", 21, false],

  // 10 Results
  ["10.1", "Counting, tabulating and announcing of election results at the polling stations", "2027-08-10", "2027-08-11", 2, true],
  ["10.2", "Receiving, collation, tallying, announcing/declaring of election results at the tallying centres", "2027-08-11", "2027-08-17", 7, true],
  ["10.3", "Issuance of certificate of election to elected persons", "2027-08-11", "2027-08-17", 7, true],
  ["10.4", "Issuance of certificate of election to the Chief Justice and the incumbent President", "2027-08-11", "2027-08-17", 7, true],
  ["10.5", "Retrieval, storage and archival of election statutory forms and materials", "2027-08-11", "2027-08-31", 21, false],
  ["10.6", "Gazettement of elected persons", "2027-08-17", "2027-08-23", 7, true],
  ["10.7", "Allocation of special seats through party lists", "2027-08-18", "2027-09-16", 30, true],
  ["10.8", "Gazettement of persons elected through the party list", "2027-09-16", "2027-09-16", 1, true],

  // 11 Petitions
  ["11.1", "Presidential election petition — filing", "2027-08-17", "2027-08-24", 7, true],
  ["11.2", "Presidential election petition — hearing and determination", null, "2027-09-07", 14, true],
  ["11.3", "Parliamentary and county elections petition — filing", "2027-08-17", "2027-09-14", 28, true],
  ["11.4", "Parliamentary and county elections petition — hearing and determination", "2027-09-15", "2028-03-15", 180, true],

  // 12 Voter education
  ["12.1", "Review voter education curriculum, policy and manuals", "2026-07-27", "2026-10-24", 90, false],
  ["12.2", "Production and dissemination of information, education and communication materials", "2026-07-27", "2027-10-24", 454, true],
  ["12.3", "Translate, transcribe and disseminate voter education materials for marginalised groups in accessible formats", "2026-07-27", "2026-10-24", 90, true],
  ["12.4", "Digitise IEC materials", "2026-02-23", "2027-10-08", 593, false],
  ["12.5", "Establish a local language translation committee at the national level", "2026-07-27", "2026-08-26", 30, false],
  ["12.6", "Build capacity of voter education champions", "2026-10-31", "2026-11-09", 10, false],
  ["12.7", "Build capacity of staff on voter education", "2026-11-16", "2026-12-16", 30, false],
  ["12.9", "Accredit voter education providers", "2025-07-15", "2027-03-15", 608, true],
  ["12.10", "Develop and update a database for voter education providers", "2025-07-15", "2027-02-09", 567, false],
  ["12.11", "Develop coordination and monitoring mechanism for voter education providers", "2026-10-01", "2026-11-30", 60, false],
  ["12.12", "Conduct voter education for ECVR I", "2026-03-23", "2026-04-30", 38, true],
  ["12.13", "Conduct voter education for ECVR II", "2026-11-21", "2027-01-10", 50, true],
  ["12.14", "Conduct voter education and outreach for marginalised groups", "2026-02-23", "2027-10-08", 593, true],
  ["12.15", "Conduct voter education for Kenyan citizens residing outside the country", "2026-02-23", "2027-10-08", 593, true],
  ["12.16", "Conduct voter education for verification of biometric data on the Register of Voters", "2027-04-29", "2027-05-28", 30, true],
  ["12.17", "Conduct thematic voter education for GE (campaign financing, nominations, dispute resolution, campaign and election day)", "2027-07-13", "2027-08-16", 35, true],
  ["12.18", "Conduct voter education in institutions of learning", "2025-07-01", "2027-02-08", 588, true],
  ["12.19", "Undertake quality assurance of voter education", "2025-09-29", "2027-08-16", 687, false],

  // 13 Partnerships
  ["13.1", "Review partnership and stakeholder policy and manuals", "2026-07-27", "2026-10-24", 90, false],
  ["13.2", "Map stakeholders and partners at national, county and constituency levels", "2025-07-15", "2027-03-15", 608, false],
  ["13.3", "Carry out partner and stakeholder needs assessment", "2026-07-27", "2027-02-24", 60, false],
  ["13.4", "Establish information-sharing linkages with relevant agencies", "2026-02-23", "2027-10-08", 593, false],
  ["13.5", "Engage and execute MoUs and partnership agreements with organisations serving marginalised groups", "2026-02-23", "2027-10-08", 593, true],
  ["13.6", "Collaborate with Minorities and Marginalised Affairs Unit (MMAU) to enhance participation of minorities, marginalised, pastoralists and nomadic communities", "2026-02-23", "2027-10-08", 593, true],
  ["13.7", "Collaborate with Ministry of Foreign and Diaspora Affairs to enhance participation of citizens living outside Kenya", "2026-02-23", "2027-10-08", 593, true],
  ["13.8", "Conduct county-based election conferences", "2026-08-31", "2027-05-06", 172, true],
  ["13.9", "Build capacity of staff on partnerships and stakeholder engagement regulatory and policy framework", "2026-11-02", "2027-01-24", 90, false],
  ["13.10", "Hold youth dialogue forums on electoral activities", "2026-02-23", "2027-10-07", 228, true],
  ["13.11", "Coordinate Election Technical Assistance Providers (ETAPs) on elections", "2026-03-25", "2027-10-08", 563, false],
  ["13.12", "Undertake peer learning exchanges with EMBs for best practice in election management", "2026-01-05", "2027-10-08", 642, false],
  ["13.13", "Facilitate accreditation of stakeholders and partners for National Tallying Centre", "2027-07-02", "2027-08-01", 30, true],
  ["13.14", "Undertake quality assurance for partnership and stakeholder engagement", "2026-02-23", "2027-10-08", 593, false],

  // 14 Observation
  ["14.1", "Review of the Election Observer Guidelines and code of conduct", "2026-02-23", "2026-08-21", 180, true],
  ["14.2", "Review the Accreditation Management System", "2026-10-01", "2026-11-30", 60, false],
  ["14.3", "Accredit long- and short-term election observers", "2026-12-01", "2027-07-07", 218, true],
  ["14.4", "Produce observer kits", "2026-11-13", "2027-02-11", 90, false],
  ["14.5", "Review Election Observers Management System", "2026-02-23", "2026-08-21", 180, false],
  ["14.6", "Establish an accreditation centre for observers for all electoral processes", "2027-01-11", "2027-02-09", 30, true],
  ["14.7", "Conduct election observer briefing for electoral activities", "2026-07-01", "2027-07-25", 380, true],
  ["14.8", "Receive and compile election observer reports", "2026-09-10", "2027-10-08", 365, false],
  ["14.9", "Develop and update a database for election observers", "2027-01-11", "2027-02-09", 30, false],
  ["14.10", "Hold a National Election Conference", "2027-06-17", "2027-06-18", 2, true],

  // 15.1 Internal communications
  ["15.1.1", "Develop and operationalise an internal communication policy and SOPs", "2025-10-01", "2027-08-20", 688, false],
  ["15.1.2", "Publish and disseminate quarterly “The Ballot” newsletter", "2025-07-01", "2027-10-09", 830, false],
  ["15.1.3", "Compile and disseminate the weekly Uchaguzi e-bulletin", "2025-07-01", "2027-10-09", 830, false],
  ["15.1.4", "Communicate with internal and external stakeholders through IEBC-branded bulk SMS", "2025-07-01", "2027-10-09", 830, true],
  ["15.1.5", "Sensitise Commissioners and senior management on communication", "2027-02-10", "2027-05-19", 98, false],
  ["15.1.6", "Build capacity of staff on media and social media handling", "2027-02-10", "2027-05-19", 98, false],
  ["15.1.7", "Train communication staff on new media", "2025-07-01", "2027-10-09", 830, false],

  // 15.2 External communications
  ["15.2.1", "Review and operationalise strategic communication policy, strategy, plan and SOPs", "2025-10-01", "2027-10-09", 688, false],
  ["15.2.2", "Develop and operationalise a digital and social media strategy", "2026-05-11", "2027-10-09", null, true],
  ["15.2.3", "Review and operationalise the General Election communications strategy and crisis communication plan", "2026-03-07", "2027-11-10", 613, true],
  ["15.2.4", "Publicise and disseminate GE information through pressers, media briefs, bulk SMS, website, press kits, infomercials, social media, interviews, podcasts, “Speak to the Chairman” briefings, concert caravans and town halls", "2025-07-01", "2027-10-09", 830, true],
  ["15.2.5", "Establish and operationalise a communication hub", "2026-02-01", "2027-10-09", 615, false],
  ["15.2.6", "Hold the National Election Conference", "2027-06-16", "2027-06-18", 3, true],
  ["15.2.7", "Train customer experience agents at the National Elections and Communications Centre", "2027-07-23", "2027-07-25", 3, false],
  ["15.2.8", "Conduct national, county and constituency media fora", "2027-07-12", "2027-07-18", 6, true],
  ["15.2.9", "Set up and operationalise the media centre at the National Tallying Centre", "2027-07-01", "2027-08-20", 50, true],
  ["15.2.10", "Set up and operationalise the National Elections and Communications Centre (NECC)", "2027-07-01", "2027-08-20", 50, true],
  ["15.2.11", "Provide a live video feed from the tallying centre", "2027-07-21", "2027-08-20", 30, true],
  ["15.2.12", "Train media and social media influencers on electoral activities", "2025-07-01", "2027-10-09", 830, true],
  ["15.2.13", "Engage strategic communication consultancy firms", "2026-03-07", "2027-11-10", 613, false],
  ["15.2.14", "Set up and operationalise county and constituency communication centres", "2027-08-02", "2027-08-16", 15, true],
  ["15.2.15", "Undertake media and social media monitoring on election reporting", "2026-10-01", "2027-08-20", 324, false],
  ["15.2.16", "Produce information materials in various formats and languages on electoral activities", "2026-10-01", "2027-08-20", 324, true],
  ["15.2.17", "Conduct media campaigns around electoral activities", "2026-02-23", "2027-10-08", 593, true],
  ["15.2.18", "Disseminate information materials in various formats and languages on electoral activities", "2026-02-23", "2027-10-08", 593, true],
  ["15.2.19", "Accredit media for the General Election", "2027-05-03", "2027-07-31", 90, true],
  ["15.2.20", "Produce press kits for the General Election", "2027-05-03", "2027-07-31", 90, false],
  ["15.2.21", "Participate in cultural festivities, trade shows, county forums and exhibitions", "2025-07-01", "2027-10-09", 830, true],
  ["15.2.22", "Hold meetings with media owners, editors and political reporters", "2025-07-01", "2027-10-09", 830, false],
  ["15.2.23", "Improve brand visibility through signage, posters, branded offices and merchandise", "2025-07-01", "2027-10-09", 830, false],
  ["15.2.24", "Manage Commission outreach activities", "2025-07-01", "2027-10-09", 830, true],
  ["15.2.25", "Update the Commission website and social media platforms", "2025-07-01", "2027-10-09", 830, true],
  ["15.2.26", "Produce and disseminate thematic songs", "2025-07-01", "2027-10-09", 830, true],
  ["15.2.27", "Produce branded merchandise", "2025-07-01", "2027-10-09", 830, false],
  ["15.2.28", "Participate in conferences and workshops organised by professional bodies", "2025-07-01", "2027-10-09", 830, false],
  ["15.2.29", "Undertake CSR initiatives", "2025-07-01", "2027-10-09", 830, false],

  // 16 Risk & security
  ["16.1", "Review the Risk Management Framework", "2026-07-01", "2026-07-31", 30, false],
  ["16.2", "Sensitise Commissioners and senior management on election security", "2026-08-08", "2026-09-08", 30, false],
  ["16.3", "Conduct baseline survey on early warning signs of electoral violence", "2026-08-08", "2026-09-08", 30, true],
  ["16.4", "Establish inter-agency collaboration between the Commission, National Police Service and other stakeholders", "2026-02-23", "2027-10-30", 593, true],
  ["16.5", "Review of the election security coordination framework", "2026-07-01", "2026-07-31", 30, false],
  ["16.6", "Review Election Security Handbook, security guide roll cards and training manual on election security", "2026-07-01", "2026-08-14", 45, false],
  ["16.7", "Train risk champions from counties and directorates on risk management", "2026-08-17", "2026-08-22", 5, false],
  ["16.8", "Conduct continuous risk assessment", "2026-02-23", "2027-10-30", 593, false],
  ["16.9", "Deploy Electoral Risk Management Tool", "2026-09-07", "2027-10-30", 420, false],
  ["16.10", "Establish and operationalise election risk centre", "2027-07-31", "2027-08-30", 30, false],
  ["16.11", "Conduct cascaded training of security officers on electoral security", "2027-02-14", "2027-05-02", 77, false],

  // 17 Data protection
  ["17.1", "Review the data protection framework", "2026-03-03", "2026-06-30", 120, true],
  ["17.2", "Train staff on data protection and privacy policy", "2026-09-26", "2026-09-30", 5, false],
  ["17.3", "Conduct Commission data mapping", "2026-07-31", "2026-08-31", 30, false],

  // 18 Internal audit
  ["18.1", "Review Internal Audit framework", "2026-02-16", "2026-06-30", 90, false],
  ["18.2", "Conduct regular assurance audits of Commission processes", "2025-07-01", "2027-10-08", 890, false],

  // 19 ICT
  ["19.1", "Review of IT governance policy and instruments", "2026-07-27", "2026-09-10", 45, false],
  ["19.2", "Review of Business Continuity Processes (BCP) and Disaster Recovery Plan (DRP)", "2026-07-27", "2026-09-10", 45, false],
  ["19.3", "Upgrade of Commission-owned online platforms", "2025-09-04", "2026-12-02", 454, true],
  ["19.4", "Configure and distribute KIEMS kits for continuous voter registration", "2025-07-18", "2025-08-26", 40, true],
  ["19.5", "Configure and distribute KIEMS kits for Enhanced Continuous Voter Registration (ECVR) I", "2026-02-19", "2026-03-20", 30, true],
  ["19.6", "Provide technical support for ECVR I", "2026-03-30", "2026-04-28", 30, false],
  ["19.7", "Acquire and deploy appropriate electoral technology for conduct of the General Election", "2026-02-23", "2027-08-10", 127, true],
  ["19.8", "Deploy RFID-based inventory system", "2026-08-03", "2026-09-16", 45, false],
  ["19.9", "Configure and distribute KIEMS kits for ECVR II", "2026-10-22", "2026-11-20", 30, true],
  ["19.10", "Provide technical support for ECVR II", "2026-11-30", "2027-01-08", 40, false],
  ["19.11", "Configure and distribute KIEMS kits for voter verification exercise", "2027-03-15", "2027-04-13", 30, true],
  ["19.12", "Provide technical support for voter verification exercise", "2027-04-23", "2027-05-22", 30, false],
  ["19.13", "Generate Register of Voters for certification", "2027-05-27", "2027-06-25", 30, false],
  ["19.14", "Train political parties on election technology", "2027-02-16", "2027-02-20", 5, true],
  ["19.15", "Modify infrastructure of the Election Technology Centre (ETC)", "2026-08-03", "2026-12-30", 150, false],
  ["19.16", "Expand, support and maintain server infrastructure", "2026-09-03", "2026-12-31", 120, false],
  ["19.17", "Upgrade the backup infrastructure for the General Election", "2026-09-03", "2026-12-31", 120, false],
  ["19.18", "Set up of ICT security infrastructure", "2026-09-03", "2026-12-31", 120, false],
  ["19.19", "Election Technology Open Day", "2027-02-11", "2027-02-12", 2, true],
  ["19.20", "Review the electoral system simulation framework", "2026-11-02", "2026-12-01", 30, false],
  ["19.21", "Test and simulate election technology", "2027-02-02", "2027-02-09", 7, true],
  ["19.22", "Undertake network survey to determine Quality of Service (QoS) in polling stations and tallying centres", "2026-09-03", "2026-10-17", 45, true],
  ["19.23", "Engagement and support of Mobile Network Operators (MNO) for the General Election", "2027-01-04", "2027-09-10", 250, false],
  ["19.24", "Set up of the General Elections Results Transmission Network", "2027-02-02", "2027-10-09", 250, true],
  ["19.25", "Conduct an audit of election technology", "2026-07-27", "2026-10-24", 90, true],
  ["19.26", "Testing and certification of election technology", "2027-02-02", "2027-03-03", 30, true],
  ["19.27", "Set up of the ICT Security and Network Operation Centre", "2027-02-02", "2027-10-09", 250, false],
  ["19.28", "Provide technical support for the 2027 General Election", "2027-07-15", "2027-10-09", 85, false],

  // 20 Finance
  ["20.1", "Review of the 3-year MTEF budgetary requirements", "2025-08-04", "2028-04-27", 998, false],
  ["20.2", "Engage the National Treasury and Parliament for General Election funding", "2025-07-01", "2027-10-09", 831, false],
  ["20.3", "Mobilise additional resources from development partners", "2025-07-01", "2027-10-09", 831, false],

  // 21 Procurement
  ["21.1", "Develop and review procurement plan for the General Election", "2025-07-01", "2027-07-01", 731, false],
  ["21.2", "Develop and review the disposal plan", "2025-07-01", "2027-07-01", 731, false],
  ["21.3", "Stock taking of inventory", "2026-02-23", "2026-05-23", 90, false],
  ["21.4", "Disposal of obsolete materials", "2026-04-22", "2026-06-30", 70, false],
  ["21.5", "Prepare an inventory of the Commission’s elections material and equipment across the country", "2026-04-22", "2026-06-30", 70, false],
  ["21.6", "Procurement of General Elections materials and services", "2025-07-01", "2027-10-09", 830, false],

  // 22 Research
  ["22.1", "Develop research policy", "2026-07-01", "2026-09-29", 90, false],
  ["22.2", "Develop a monitoring and evaluation framework", "2026-07-01", "2026-09-29", 90, false],
  ["22.3", "Develop Research Monitoring and Evaluation system", "2026-07-01", "2026-12-28", 180, false],
  ["22.4", "Conduct monthly, quarterly and annual M&E", "2026-07-01", "2027-10-09", 65, false],
  ["22.5", "Conduct research and surveys on thematic areas", "2025-07-01", "2027-10-09", 830, false],
  ["22.6", "Conduct research colloquium", "2025-07-01", "2027-10-09", 830, false],
  ["22.7", "Conduct post-election evaluation for the General Election", "2027-08-11", "2029-02-12", 551, true],
  ["22.8", "Develop General Election results data report (compendium)", "2027-10-12", "2027-12-09", 120, true],
  ["22.9", "Develop General Election observer reports (compendium)", "2027-10-12", "2027-12-09", 120, true],
  ["22.10", "Gazette the post-election evaluation report for the 2027 General Election", "2027-08-17", "2029-02-17", 551, true],
];

function sectionIdFromRef(ref) {
  return ref.split(".")[0];
}

function subsectionFromRef(ref) {
  const parts = ref.split(".");
  if (parts.length >= 2 && ["1", "2"].includes(parts[0]) === false) {
    // e.g. 15.1.x -> 15.1, 2.1.x -> 2.1
  }
  if (parts.length >= 2) return `${parts[0]}.${parts[1]}`;
  return undefined;
}

const SUBSECTION_LABELS = {
  "2.1": "Political party candidates",
  "2.2": "Independent candidates",
  "2.3": "Verification of supporters for presidential candidates",
  "15.1": "Internal communications",
  "15.2": "External communications",
};

const header = `/**
 * IEBC Election Operation Plan (EOP) 2025–2027 — Appendix I: Implementation Timelines.
 *
 * Extracted for civic reference from the IEBC EOP appendix (same document family as the
 * 2027 General Election campaign-period notice). Dates converted to ISO YYYY-MM-DD.
 * Duration days are as published; some OCR edge cases were normalised for start/end only.
 *
 * Source PDF (campaign period / related IEBC publication):
 * https://www.iebc.or.ke/uploads/resources/tpFfOlBLRh.pdf
 *
 * Confirm critical deadlines on the official IEBC publication — this page is an independent civic guide.
 */

export type EopActivity = {
  /** Appendix serial (e.g. "4.21", "15.2.4") */
  ref: string;
  title: string;
  /** ISO start date when known */
  startDate: string | null;
  /** ISO end / finish date when known */
  endDate: string | null;
  /** Published duration in days, if given */
  durationDays: number | null;
  /** Top-level appendix section id ("1" … "22") */
  sectionId: string;
  /** Optional mid-level group (e.g. "2.1", "15.2") */
  subsectionId?: string;
  /**
   * Whether voters, candidates, parties, media or observers typically need this date.
   * Used to surface “key public dates” without hiding the full operational plan.
   */
  publicInterest: boolean;
};

export type EopSection = {
  id: string;
  title: string;
  summary: string;
  publicInterest: boolean;
};

export const EOP_META = {
  title: "Election Operation Plan 2025–2027",
  appendix: "Appendix I: EOP Implementation Timelines",
  electionDate: "2027-08-10",
  electionLabel: "Tuesday, 10 August 2027 General Election",
  sourceUrl: "https://www.iebc.or.ke/uploads/resources/tpFfOlBLRh.pdf",
  sourceLabel: "IEBC official timeline PDF",
  description:
    "EOP timelines for each activity during the General Election, including start and end dates.",
} as const;

export const EOP_SECTIONS: EopSection[] = ${JSON.stringify(sections, null, 2)};

export const EOP_SUBSECTION_LABELS: Record<string, string> = ${JSON.stringify(SUBSECTION_LABELS, null, 2)};

export const eopActivities2027: EopActivity[] = [
`;

const rows = activities.map(([ref, title, start, end, days, pub]) => {
  const sectionId = sectionIdFromRef(ref);
  const sub =
    ref.split(".").length >= 2 && SUBSECTION_LABELS[`${ref.split(".")[0]}.${ref.split(".")[1]}`]
      ? `${ref.split(".")[0]}.${ref.split(".")[1]}`
      : ref.split(".").length >= 3
        ? `${ref.split(".")[0]}.${ref.split(".")[1]}`
        : undefined;

  // For 15.x and 2.x multi-level
  let subsectionId;
  const parts = String(ref).split(".");
  if (parts.length >= 3) {
    subsectionId = `${parts[0]}.${parts[1]}`;
  } else if (parts.length === 2 && SUBSECTION_LABELS[`${parts[0]}.${parts[1]}`]) {
    // section-level 2.1 as container? skip — only activities under 2.1.x get subsection
  }

  // Force subsection for 2.1.x, 2.2.x, 2.3.x, 15.1.x, 15.2.x
  if (/^2\.[123]\./.test(ref) || /^15\.[12]\./.test(ref)) {
    subsectionId = `${parts[0]}.${parts[1]}`;
  }

  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `  {
    ref: "${ref}",
    title: "${esc(title)}",
    startDate: ${start ? `"${start}"` : "null"},
    endDate: ${end ? `"${end}"` : "null"},
    durationDays: ${days === null ? "null" : days},
    sectionId: "${sectionId}",
    ${subsectionId ? `subsectionId: "${subsectionId}",` : ""}
    publicInterest: ${pub},
  }`;
});

const footer = `
];

/** All EOP activities for the 2027 cycle */
export const eopActivitiesByElection: Record<number, EopActivity[]> = {
  2027: eopActivities2027,
};
`;

writeFileSync(outPath, header + rows.join(",\n") + footer, "utf8");
console.log(`Wrote ${activities.length} activities → ${outPath}`);
