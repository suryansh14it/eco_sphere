import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Disable middleware authentication - allow all routes
  return NextResponse.next();
}

export const config = {
  matcher: []
};
