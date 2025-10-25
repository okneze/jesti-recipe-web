import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Temporary Recipe Access API
 * 
 * Generates temporary tokens for unauthenticated recipe access.
 * Tokens are valid for 15 minutes to allow Bring's servers to parse the recipe.
 */

// Initialize global token store
if (typeof global.recipeTokenStore === 'undefined') {
  global.recipeTokenStore = new Map<string, { recipeSlug: string; expiresAt: number }>();
  
  // Cleanup expired tokens periodically
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of global.recipeTokenStore.entries()) {
      if (data.expiresAt < now) {
        global.recipeTokenStore.delete(token);
      }
    }
  }, 60000); // Cleanup every minute
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API /api/recipe-temp POST] Received request');
    
    const body = await request.json();
    console.log('[API] Request body:', JSON.stringify(body));
    
    const { recipeSlug } = body;
    
    if (!recipeSlug) {
      console.error('[API] No recipe slug provided');
      return NextResponse.json(
        { error: 'Recipe slug is required' },
        { status: 400 }
      );
    }

    console.log('[API] Recipe slug:', recipeSlug);

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    console.log('[API] Generated token:', token);
    
    // Token expires in 15 minutes
    const expiresAt = Date.now() + 15 * 60 * 1000;
    
    // Store token
    global.recipeTokenStore.set(token, { recipeSlug, expiresAt });
    console.log('[API] Token stored in memory. Total tokens:', global.recipeTokenStore.size);
    
    // Build the temporary URL using the actual host from request headers
    // This ensures we use the production domain, not localhost
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
    const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;
    const tempUrl = `${baseUrl}/api/recipe-temp/${token}`;
    
    console.log('[API] Host detection:');
    console.log('  - x-forwarded-host:', request.headers.get('x-forwarded-host'));
    console.log('  - host:', request.headers.get('host'));
    console.log('  - nextUrl.host:', request.nextUrl.host);
    console.log('  - Selected host:', host);
    console.log('  - x-forwarded-proto:', request.headers.get('x-forwarded-proto'));
    console.log('  - Selected protocol:', protocol);
    console.log('  - Base URL:', baseUrl);
    console.log('  - Temporary URL:', tempUrl);
    
    const responseData = {
      tempUrl,
      token,
      expiresAt,
      expiresIn: '15 minutes'
    };
    
    console.log('[API] Returning response:', JSON.stringify(responseData));
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('[API] Error generating temporary token:', error);
    return NextResponse.json(
      { error: 'Failed to generate temporary token' },
      { status: 500 }
    );
  }
}

// Type declaration for global token store
declare global {
  // eslint-disable-next-line no-var
  var recipeTokenStore: Map<string, { recipeSlug: string; expiresAt: number }>;
}
