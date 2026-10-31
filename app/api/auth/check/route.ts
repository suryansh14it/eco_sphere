import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    return NextResponse.json({
      authenticated: !!user,
      hasSession: !!user,
      user: user
        ? { id: user._id, name: user.name, email: user.email, role: user.role }
        : null,
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
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ isAuthenticated: false, allowedAccess: false });
    }

    // Get requested role from body
    const body = await request.json().catch(() => ({}));
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
