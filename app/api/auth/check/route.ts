import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated by looking at cookies
    const sessionCookie = request.cookies.get('user_session')?.value;
    
    return NextResponse.json({
      authenticated: !!sessionCookie,
      hasSession: !!sessionCookie,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Auth check failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('user_session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false, allowedAccess: false });
    }
    
    // Parse session data
    let session;
    try {
      session = JSON.parse(sessionCookie);
    } catch (e) {
      return NextResponse.json({ isAuthenticated: false, allowedAccess: false });
    }
    
    // Get user from session
    const user = await getUserById(session.userId);
    
    if (!user) {
      return NextResponse.json({ isAuthenticated: false, allowedAccess: false });
    }
    
    // Get requested role from body
    const body = await request.json();
    const { role } = body;
    
    // Check if user is allowed to access the requested dashboard
    const allowedAccess = role === user.role;
    
    return NextResponse.json({
      isAuthenticated: true,
      allowedAccess,
      userRole: user.role
    });

  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
