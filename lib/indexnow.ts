/**
 * Triggers an IndexNow ping to notify search engines of a content update.
 * @param slug - The slug of the updated resource (e.g., 'william-samoei-ruto')
 * @param type - The resource type to build the correct URL path
 */
export async function triggerIndexNow(slug: string, type: 'leaders' | 'institutions' | 'counties') {
  try {
    let path = '';
    switch (type) {
      case 'leaders':
        path = `/government/people/${slug}`;
        break;
      case 'institutions':
        path = `/government/institutions/${slug}`;
        break;
      case 'counties':
        path = `/government/counties/${slug}`;
        break;
      default:
        return;
    }

    // Always use the production URL for the payload, because IndexNow requires the real public URL
    const fullUrl = `https://www.citizenguide.ke${path}`;

    // Use a relative URL for the fetch. 
    // This guarantees it talks to localhost in dev, and production in live, without env vars.
    fetch('/api/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: fullUrl }),
    }).catch((err) => {
      // Silently fail in local dev without breaking the UI or showing red errors
      console.warn('IndexNow trigger skipped (normal in local dev):', err);
    });
  } catch (error) {
    console.error('Error in triggerIndexNow:', error);
    // We intentionally do not throw here to prevent breaking the main save flow
  }
}