/**
 * Re-exports Huduma centre data from lib/data for stable import paths.
 * Prefer importing from @/lib/data/huduma-centres when adding new code.
 */

export type { HudumaCentre, HudumaRegion } from "@/lib/data/huduma-centres";
export {
  HUDUMA_REGIONS,
  HUDUMA_SOURCE,
  hudumaCentres,
} from "@/lib/data/huduma-centres";
export {
  countiesWithHuduma,
  filterHudumaCentres,
  formatHudumaHours,
  formatHudumaTime,
  getAllHudumaCentres,
  getCentresByCounty,
  getCentresByRegion,
  getExtendedHoursCentres,
  getStandardHoursCentres,
  groupCentresByCounty,
  groupCentresByRegion,
  hudumaStats,
  regionsWithHuduma,
  regionAnchor,
  countyAnchor,
} from "@/lib/data/huduma-centres.utils";
