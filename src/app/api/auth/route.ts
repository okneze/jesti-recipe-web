import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-authenticate': 'Basic realm="Recipe Access"'
    }
  });
}
