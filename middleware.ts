import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simplified middleware that doesn't perform any authentication checks
// All authentication is now handled on the client side

export function middleware(request: NextRequest) {
  // Just pass through all requests without any modifications
  return NextResponse.next();
}

// Configure middleware to run only on specific paths if needed
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
