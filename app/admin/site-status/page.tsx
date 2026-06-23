'use client';

import { redirect } from 'next/navigation';

export default function SiteStatusControl() {
  // The kill switch / site status feature has been completely removed.
  redirect('/admin');
}
