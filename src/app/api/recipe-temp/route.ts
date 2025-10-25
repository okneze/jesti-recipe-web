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
    const { recipeSlug } = await request.json();
    
    if (!recipeSlug) {
      return NextResponse.json(
        { error: 'Recipe slug is required' },
        { status: 400 }
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 15 minutes
    const expiresAt = Date.now() + 15 * 60 * 1000;
    
    // Store token
    global.recipeTokenStore.set(token, { recipeSlug, expiresAt });
    
    // Build the temporary URL
    const baseUrl = request.nextUrl.origin;
    const tempUrl = `${baseUrl}/api/recipe-temp/${token}`;
    
    return NextResponse.json({
      tempUrl,
      token,
      expiresAt,
      expiresIn: '15 minutes'
    });
    
  } catch (error) {
    console.error('Error generating temporary token:', error);
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
