// lib/breadcrumbs.ts
import { Crumb } from "@/components/govuk/Breadcrumbs";

export function generateBreadcrumbs(segments: string[], currentEntityName?: string): Crumb[] {
  // Establish baseline structural paths required for all executive layouts
  const items: Crumb[] = [
    { text: "Home", href: "/" },
    { text: "Government", href: "/government" },
  ];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    
    // Create the sequential path loop segment by segment
    const href = `/government/${segments.slice(0, index + 1).join("/")}`;
    
    // Clean text format transform (e.g., 'foreign-affairs' -> 'Foreign Affairs')
    let text = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    
    // If it's a virtual path, clean up common names
    if (text === "Missions") text = "Diplomatic Missions";

    // Overwrite terminal segment text with the exact title name from Supabase if supplied
    if (isLast && currentEntityName) {
      text = currentEntityName;
    }

    items.push({
      text,
      // If it is the last item, set href to undefined so it renders as text instead of a link
      href: isLast ? undefined : href, 
    });
  });

  return items;
}
