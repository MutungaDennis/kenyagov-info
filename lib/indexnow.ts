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

    const fullUrl = `https://www.citizenguide.ke${path}`;

    // Fire-and-forget: We don't await this so it doesn't block the admin UI save process
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.citizenguide.ke'}/api/indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: fullUrl }),
    }).catch((err) => {
      console.error('Failed to trigger IndexNow:', err);
    });
  } catch (error) {
    console.error('Error in triggerIndexNow:', error);
    // We intentionally do not throw here to prevent breaking the main save flow
  }
}
