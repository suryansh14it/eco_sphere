import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';

// GET /api/user/dashboard-data
// Returns minimal progress/xp data for the logged-in user using the session cookie
export async function GET(request: NextRequest) {
	try {
		const sessionCookie = request.cookies.get('user_session')?.value;
		if (!sessionCookie) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		let session: { userId: string };
		try {
			session = JSON.parse(sessionCookie);
		} catch {
			return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
		}

		const user = await getUserById(session.userId);
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Compute next level threshold based on the leveling formula in models/User.ts
		const level = user.level || 1;
		const totalXp = user.xpPoints || 0;
		const xpForNextLevel = Math.pow(level, 2) * 10; // threshold to reach the next level
		const xpToNextLevel = Math.max(0, xpForNextLevel - totalXp);

		return NextResponse.json({
			success: true,
			data: {
				totalXp,
				level,
				xpForNextLevel,
				xpToNextLevel,
				environmentalImpact: user.environmentalImpact || { treesPlanted: 0, co2Offset: 0, waterSaved: 0 },
				recentActivity: (user.activityHistory || []).slice(0, 10),
			},
		});
	} catch (error) {
		console.error('dashboard-data fetch error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

