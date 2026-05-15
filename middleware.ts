import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('firebase-token'); // Agar aap cookies use kar rahe hain
  const { pathname } = request.nextUrl;

  // Authentication logic yahan handle ho sakti hai server-side par
  // Filhal hum isay empty chor rahe hain kyunki client-side guard zyada fast response dega Next.js App Router mein
  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*', '/admin-dashboard/:path*'],
};