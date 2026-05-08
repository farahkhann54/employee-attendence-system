import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/admin", "/employee"];
const authRoutes = ["/login", "/signup"];

function getDashboardPath(role?: string) {
  return role === "admin" ? "/admin" : "/employee";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const role = request.cookies.get("user_role")?.value;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(token ? getDashboardPath(role) : "/login", request.url)
    );
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};