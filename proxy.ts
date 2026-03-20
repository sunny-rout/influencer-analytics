import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/search',
  '/influencer',
  '/campaigns',
  '/admin',
];

export default auth((req) => {
  const isLoggedIn  = !!req.auth;
  const pathname    = req.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};