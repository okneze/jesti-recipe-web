import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    const validUser = process.env.BASIC_AUTH_USER;
    const validPassword = process.env.BASIC_AUTH_PASSWORD;

    if (!validUser || !validPassword) {
      return NextResponse.json(
        { error: 'Server-Konfigurationsfehler' },
        { status: 500 }
      );
    }

    if (username !== validUser || password !== validPassword) {
      return NextResponse.json(
        { error: 'Ungültiger Benutzername oder Passwort' },
        { status: 401 }
      );
    }

    // Create JWT token (valid for 90 days)
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('90d')
      .sign(JWT_SECRET);

    // Create response with cookie
    const response = NextResponse.json(
      { success: true, message: 'Login erfolgreich' },
      { status: 200 }
    );

    // Set HTTP-only cookie (90 days)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60, // 90 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
