import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

// Placeholder dashboard summary. The main user dashboard uses
// /api/user/dashboard-data; this endpoint exists for older clients.
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);

  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      xpPoints: user.xpPoints,
      level: user.level,
      environmentalImpact: user.environmentalImpact,
    },
  });
}
