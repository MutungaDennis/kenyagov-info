export const ADMIN_NAVIGATION = [
  { title: "Overview", items: [{ path: "", label: "Dashboard" }] },
  { title: "Government directory", items: [
    { path: "institutions", label: "Institutions" }, { path: "schools", label: "Schools" },
    { path: "officials", label: "National officials" }, { path: "mcas", label: "County MCAs" },
  ] },
  { title: "Law and publications", items: [
    { path: "constitution", label: "Constitution" }, { path: "legislation", label: "Acts and county laws" },
    { path: "gazette", label: "Kenya Gazette" }, { path: "documents", label: "Documents" },
    { path: "hansard", label: "Parliamentary Hansard" },
  ] },
  { title: "Services and elections", items: [
    { path: "services", label: "Public services" }, { path: "polling-stations/upload", label: "Polling stations" },
  ] },
  { title: "Citizen responses", items: [
    { path: "contact", label: "Contact messages" }, { path: "feedback", label: "General feedback" },
    { path: "bug-reports", label: "Bug reports" },
  ] },
  { title: "Site management", items: [
    { path: "analytics", label: "Analytics" }, { path: "site-status", label: "Site status" },
  ] },
] as const;
