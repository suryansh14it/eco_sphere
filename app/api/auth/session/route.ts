import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      xpPoints: user.xpPoints,
      level: user.level,
    },
  });
}
