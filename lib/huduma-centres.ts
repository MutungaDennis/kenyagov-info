/**
 * Major Huduma Centre locations compiled from public government information.
 * Not an exhaustive live directory — always confirm opening hours and services
 * with official Huduma Kenya / county notices before travelling.
 */

export type HudumaCentre = {
  name: string;
  county: string;
  cityOrTown: string;
  notes?: string;
};

export const hudumaCentres: HudumaCentre[] = [
  { name: "Huduma Centre — GPO", county: "Nairobi", cityOrTown: "Nairobi CBD", notes: "General Post Office building" },
  { name: "Huduma Centre — City Square", county: "Nairobi", cityOrTown: "Nairobi CBD" },
  { name: "Huduma Centre — Kibera", county: "Nairobi", cityOrTown: "Kibera" },
  { name: "Huduma Centre — Eastleigh", county: "Nairobi", cityOrTown: "Eastleigh" },
  { name: "Huduma Centre — Makadara", county: "Nairobi", cityOrTown: "Makadara" },
  { name: "Huduma Centre — Mombasa", county: "Mombasa", cityOrTown: "Mombasa" },
  { name: "Huduma Centre — Kisumu", county: "Kisumu", cityOrTown: "Kisumu" },
  { name: "Huduma Centre — Nakuru", county: "Nakuru", cityOrTown: "Nakuru" },
  { name: "Huduma Centre — Eldoret", county: "Uasin Gishu", cityOrTown: "Eldoret" },
  { name: "Huduma Centre — Kakamega", county: "Kakamega", cityOrTown: "Kakamega" },
  { name: "Huduma Centre — Kisii", county: "Kisii", cityOrTown: "Kisii" },
  { name: "Huduma Centre — Nyeri", county: "Nyeri", cityOrTown: "Nyeri" },
  { name: "Huduma Centre — Meru", county: "Meru", cityOrTown: "Meru" },
  { name: "Huduma Centre — Embu", county: "Embu", cityOrTown: "Embu" },
  { name: "Huduma Centre — Machakos", county: "Machakos", cityOrTown: "Machakos" },
  { name: "Huduma Centre — Kitui", county: "Kitui", cityOrTown: "Kitui" },
  { name: "Huduma Centre — Garissa", county: "Garissa", cityOrTown: "Garissa" },
  { name: "Huduma Centre — Wajir", county: "Wajir", cityOrTown: "Wajir" },
  { name: "Huduma Centre — Mandera", county: "Mandera", cityOrTown: "Mandera" },
  { name: "Huduma Centre — Isiolo", county: "Isiolo", cityOrTown: "Isiolo" },
  { name: "Huduma Centre — Marsabit", county: "Marsabit", cityOrTown: "Marsabit" },
  { name: "Huduma Centre — Turkana (Lodwar)", county: "Turkana", cityOrTown: "Lodwar" },
  { name: "Huduma Centre — West Pokot (Kapenguria)", county: "West Pokot", cityOrTown: "Kapenguria" },
  { name: "Huduma Centre — Trans Nzoia (Kitale)", county: "Trans Nzoia", cityOrTown: "Kitale" },
  { name: "Huduma Centre — Bungoma", county: "Bungoma", cityOrTown: "Bungoma" },
  { name: "Huduma Centre — Busia", county: "Busia", cityOrTown: "Busia" },
  { name: "Huduma Centre — Siaya", county: "Siaya", cityOrTown: "Siaya" },
  { name: "Huduma Centre — Homa Bay", county: "Homa Bay", cityOrTown: "Homa Bay" },
  { name: "Huduma Centre — Migori", county: "Migori", cityOrTown: "Migori" },
  { name: "Huduma Centre — Kericho", county: "Kericho", cityOrTown: "Kericho" },
  { name: "Huduma Centre — Bomet", county: "Bomet", cityOrTown: "Bomet" },
  { name: "Huduma Centre — Nandi (Kapsabet)", county: "Nandi", cityOrTown: "Kapsabet" },
  { name: "Huduma Centre — Laikipia (Nanyuki)", county: "Laikipia", cityOrTown: "Nanyuki" },
  { name: "Huduma Centre — Narok", county: "Narok", cityOrTown: "Narok" },
  { name: "Huduma Centre — Kajiado", county: "Kajiado", cityOrTown: "Kajiado" },
  { name: "Huduma Centre — Kiambu", county: "Kiambu", cityOrTown: "Kiambu" },
  { name: "Huduma Centre — Murang'a", county: "Murang'a", cityOrTown: "Murang'a" },
  { name: "Huduma Centre — Kirinyaga (Kerugoya)", county: "Kirinyaga", cityOrTown: "Kerugoya" },
  { name: "Huduma Centre — Tharaka-Nithi (Chuka)", county: "Tharaka-Nithi", cityOrTown: "Chuka" },
  { name: "Huduma Centre — Kwale", county: "Kwale", cityOrTown: "Kwale" },
  { name: "Huduma Centre — Kilifi", county: "Kilifi", cityOrTown: "Kilifi" },
  { name: "Huduma Centre — Taita-Taveta (Voi)", county: "Taita-Taveta", cityOrTown: "Voi" },
  { name: "Huduma Centre — Lamu", county: "Lamu", cityOrTown: "Lamu" },
  { name: "Huduma Centre — Tana River (Hola)", county: "Tana River", cityOrTown: "Hola" },
  { name: "Huduma Centre — Samburu (Maralal)", county: "Samburu", cityOrTown: "Maralal" },
  { name: "Huduma Centre — Baringo (Kabarnet)", county: "Baringo", cityOrTown: "Kabarnet" },
  { name: "Huduma Centre — Elgeyo-Marakwet (Iten)", county: "Elgeyo-Marakwet", cityOrTown: "Iten" },
  { name: "Huduma Centre — Vihiga", county: "Vihiga", cityOrTown: "Vihiga" },
  { name: "Huduma Centre — Nyamira", county: "Nyamira", cityOrTown: "Nyamira" },
  { name: "Huduma Centre — Makueni (Wote)", county: "Makueni", cityOrTown: "Wote" },
].sort((a, b) => a.county.localeCompare(b.county) || a.name.localeCompare(b.name));

export function countiesWithHuduma(): string[] {
  return Array.from(new Set(hudumaCentres.map((c) => c.county))).sort();
}
