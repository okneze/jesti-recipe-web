import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Skip authentication for temporary recipe URLs
  if (url.pathname.startsWith('/api/recipe-temp/')) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get('auth-token')?.value;

  if (token) {
    try {
      // Verify JWT token
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      console.log('Invalid token:', error);
    }
  }

  // Check for Basic Auth (backwards compatibility)
  const basicAuth = request.headers.get('authorization');
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    const validUser = process.env.BASIC_AUTH_USER;
    const validPassword = process.env.BASIC_AUTH_PASSWORD;

    if (validUser && validPassword && user === validUser && pwd === validPassword) {
      return NextResponse.next();
    }
  }

  // Redirect to login page with return URL
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnUrl', encodeURIComponent(url.pathname + url.search));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api/auth|api/login|api/logout|api/health|api/image|api/recipe-temp|login|_next/static|_next/image|favicon.ico).*)'],
};