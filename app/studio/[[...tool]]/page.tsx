'use client';

/**
 * This route handles the Sanity Studio authoring environment
 */

import dynamic from 'next/dynamic';
import config from '../../../sanity.config';

// Force Next.js to ignore the Studio during server-side build steps
const NextStudioClientOnly = dynamic(
  () => import('next-sanity/studio').then((mod) => mod.NextStudio),
  { ssr: false }
);

export default function StudioPage() {
  return <NextStudioClientOnly config={config} />;
}
