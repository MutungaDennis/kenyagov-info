import { getPageViews } from '@/lib/supabase/analytics';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAnalytics() {
  const data = await getPageViews();
  return <AnalyticsClient initialData={data} />;
}
