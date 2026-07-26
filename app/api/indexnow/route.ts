import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'fa8fbed18df4406abe23a647ba1d9644';
const HOST = 'www.citizenguide.ke';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: [url],
      }),
    });

    if (response.ok) {
      console.log(`✅ IndexNow: Successfully submitted ${url}`);
      return NextResponse.json({ success: true, message: 'URL submitted successfully' });
    } else {
      console.error(`❌ IndexNow: Failed to submit ${url}. Status: ${response.status}`);
      return NextResponse.json({ error: 'Failed to submit to IndexNow' }, { status: response.status });
    }
  } catch (error) {
    console.error('❌ IndexNow: Error processing request', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}