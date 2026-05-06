// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes by checking for authentication token in cookies.
 * If the user tries to access an admin route without a token, they are redirected to the login page.
 * @param request 
 * @returns 
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('AuthToken');

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};