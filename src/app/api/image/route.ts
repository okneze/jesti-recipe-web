import { NextRequest, NextResponse } from 'next/server';
import { getGitHubHeaders } from '@/app/lib/Recipedata';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const author = searchParams.get('author');
  const repository = searchParams.get('repository');
  const branch = searchParams.get('branch');
  const path = searchParams.get('path');

  if (!author || !repository || !branch || !path) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const headers = getGitHubHeaders();
    const imageUrl = `https://raw.githubusercontent.com/${author}/${repository}/${branch}/${path}`;
    
    const response = await fetch(imageUrl, {
      headers: headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}