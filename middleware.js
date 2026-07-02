/* global URLSearchParams */

import { NextResponse } from 'next/server';

const AUTH_PAGES = new Set(['/login', '/register']);
const ALWAYS_PUBLIC_PAGES = new Set([
  '/',
  '/callback/google',
  '/callback/facebook',
  '/verify-otp',
  '/upload-profile',
  '/forgot-password',
  '/reset-password',
]);

const GUEST_ALLOWED_STUDENT_LIST_PAGES = new Set([
  '/student/reading',
  '/student/listening',
  '/student/speaking',
  '/student/writing',
  '/student/forum',
]);

function isLoggedIn(role) {
  return role === 'T' || role === 'S';
}

function getDefaultRouteByRole(role) {
  if (role === 'T') {
    return '/teacher';
  }

  return '/';
}

function buildLoginRedirectUrl(request, roleHint = 'student') {
  const loginUrl = request.nextUrl.clone();
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search || ''}`;

  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('role', roleHint);
  loginUrl.searchParams.set('redirect', destination);

  return loginUrl;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('userRole')?.value;
  const loggedIn = isLoggedIn(role);

  const isTeacherRoute = pathname.startsWith('/teacher');
  const isStudentRoute = pathname.startsWith('/student');
  const isAuthPage = AUTH_PAGES.has(pathname);
  const isAlwaysPublicPage = ALWAYS_PUBLIC_PAGES.has(pathname);
  const isGuestAllowedStudentListPage = GUEST_ALLOWED_STUDENT_LIST_PAGES.has(pathname);
  const isHomeRoute = pathname === '/' || pathname === '/home';

  if (loggedIn && isAuthPage) {
    return NextResponse.redirect(new URL(getDefaultRouteByRole(role), request.url));
  }

  if (pathname === '/login') {
    const url = request.nextUrl.clone();
    const currentRole = url.searchParams.get('role');
    const redirectUrl = url.searchParams.get('redirect');

    const validRole =
      currentRole === 'teacher' || currentRole === 'student' ? currentRole : 'student';

    const cleanParams = new URLSearchParams();
    cleanParams.set('role', validRole);
    if (redirectUrl) {
      cleanParams.set('redirect', redirectUrl);
    }

    if (url.searchParams.toString() !== cleanParams.toString()) {
      url.search = cleanParams.toString();
      return NextResponse.redirect(url);
    }
  }

  if (role === 'T' && isHomeRoute) {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  if (!loggedIn) {
    if (isAlwaysPublicPage || isAuthPage || isGuestAllowedStudentListPage) {
      return NextResponse.next();
    }

    if (isTeacherRoute) {
      return NextResponse.redirect(buildLoginRedirectUrl(request, 'teacher'));
    }

    return NextResponse.redirect(buildLoginRedirectUrl(request, 'student'));
  }

  if (role === 'T' && isStudentRoute) {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  if (role === 'S' && isTeacherRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|_vercel).*)'],
};
