import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from GitHub (optional, but recommended)
    const githubEvent = request.headers.get('x-github-event');
    
    if (githubEvent === 'repository_dispatch') {
      // Revalidate the home page when recipes are updated
      revalidatePath('/');
      
      return NextResponse.json({ 
        message: 'Cache revalidated successfully',
        revalidated: true,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ 
      message: 'Invalid event type',
      revalidated: false 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ 
      message: 'Error revalidating cache',
      revalidated: false 
    }, { status: 500 });
  }
}
