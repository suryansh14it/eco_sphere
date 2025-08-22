import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session');
  
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/government', '/researcher', '/ngo', '/user'];
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedRoute && !session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('user_session');
    return response;
  }

  // Allow access to auth routes only if user is not logged in
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isAuthRoute && session) {
    try {
      const userData = JSON.parse(session.value);
      return NextResponse.redirect(new URL(`/${userData.role}`, request.url));
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('user_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/government/:path*',
    '/researcher/:path*',
    '/ngo/:path*',
    '/user/:path*',
    '/login',
    '/signup'
  ]
};
