# Reference data storage

Keep stable application definitions (navigation, labels, enums and display ordering) in code. Small reviewed reference lists can also remain in `lib/data`: they are versioned, fast and available without a database request. Moving them solely because they rarely change adds operational work without improving accuracy.

Use Supabase or the existing CMS for records editors need to update independently of deployment. Public holidays are a good candidate because annual dates, special declarations and confirmation status need editorial review. A future migration should preserve the source URL or Gazette reference, year, date, holiday type, confirmed/provisional status, publication state and verification date. Public reads should expose published records only; administrators should retain revision history.

Do not automatically migrate the existing holiday list as verified data. Review dates against authoritative sources first. The current task does not change that data or create another unverified dataset.

Institution leadership belongs in the existing database role assignments. Public profiles now use those assignments and retain former terms instead of duplicating current names in static reference files.
