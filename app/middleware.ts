import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Cookies se token ya session check karein
  // Note: Firebase client-side auth state middleware mein directly accessible nahi hota, 
  // isliye hum login ke waqt ek cookie set karenge.
  const session = request.cookies.get('session');
  const userRole = request.cookies.get('userRole')?.value; // 'admin' ya 'employee'

  const { pathname } = request.nextUrl;

  // 2. Agar user login NAHI hai aur dashboard access karne ki koshish kare
  if (!session && (pathname.startsWith('/employee') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Agar user LOGIN hai aur login/signup page par jane ki koshish kare
  if (session && (pathname === '/login' || pathname === '/signup')) {
    // Role ke mutabiq sahi dashboard par bhej dein
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/employee', request.url));
  }

  return NextResponse.next();
}

// Ye middleware in paths par trigger hoga
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};