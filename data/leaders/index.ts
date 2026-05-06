// data/leaders/index.ts
export type Leader = {
  id: string;
  name: string;
  title: string;
  category:
    | "Executive"
    | "Legislature"
    | "Judiciary"
    | "County Executive"
    | "County Assembly"
    | "Constitutional Commission"
    | "Independent Office"
    | "Security"
    | "Diplomatic";
  subCategory?: string;
  county?: string;
  constituency?: string;
  organization?: string;
  description: string;
  image?: string;
  link?: string;
};

// Import all modules
import { nationalLeaders } from "./national";
import { governors } from "./governors";
import { mps } from "./mps";
import { mcas } from "./mcas";
import { judiciary } from "./judiciary";
import { commissions } from "./commissions";
import { security } from "./security";

export const leaders: Leader[] = [
  ...nationalLeaders,
  ...governors,
  ...mps,
  ...mcas,
  ...judiciary,
  ...commissions,
  ...security,
];

export const leaderCategories = [
  { label: "All Leaders", value: "All" },
  { label: "Executive", value: "Executive" },
  { label: "Legislature", value: "Legislature" },
  { label: "Judiciary", value: "Judiciary" },
  { label: "County Executive", value: "County Executive" },
  { label: "County Assembly", value: "County Assembly" },
  { label: "Constitutional Commissions", value: "Constitutional Commission" },
  { label: "Independent Offices", value: "Independent Office" },
  { label: "Security", value: "Security" },
];