import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('fa8fbed18df4406abe23a647ba1d9644', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}