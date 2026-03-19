import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/api/auth',
    '/api/user/onboarding',
    '/api/system/status',
    '/admin/setup',
    '/api/admin/setup',
  ];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Onboarding paths
  const isOnboardingPath = pathname.startsWith('/onboarding');

  // If not authenticated, redirect to signin
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Admin protection
  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
      !pathname.startsWith('/admin/setup') &&
      !pathname.startsWith('/api/admin/setup')) {
    if (!token || (token as any).role !== 'ADMIN') {
      // Redirect UI requests, return error for API requests
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
