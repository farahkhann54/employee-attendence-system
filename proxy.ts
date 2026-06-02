import { NextResponse } from 'next/server';

export function proxy() {

  // Simple Redirect logic agar zaroorat ho (Optional)
  // if (!token && pathname.startsWith('/admin-dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*', '/admin-dashboard/:path*'],
};
