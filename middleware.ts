import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-token')?.value;
  const { pathname } = request.nextUrl;

  // Simple Redirect logic agar zaroorat ho (Optional)
  // if (!token && pathname.startsWith('/admin-dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*', '/admin-dashboard/:path*'],
};