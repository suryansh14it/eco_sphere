import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';

// GET /api/user/dashboard-data
// Returns minimal progress/xp data for the user (no authentication required for now)
export async function GET(request: NextRequest) {
	try {
		// For now, return mock data since we removed session authentication
		const mockUser = {
			level: 1,
			xpPoints: 0,
			environmentalImpact: { treesPlanted: 0, co2Offset: 0, waterSaved: 0 },
			activityHistory: []
		};

		// Compute next level threshold based on the leveling formula in models/User.ts
		const level = mockUser.level || 1;
		const totalXp = mockUser.xpPoints || 0;
		const xpForNextLevel = Math.pow(level, 2) * 10; // threshold to reach the next level
		const xpToNextLevel = Math.max(0, xpForNextLevel - totalXp);

		return NextResponse.json({
			success: true,
			data: {
				totalXp,
				level,
				xpForNextLevel,
				xpToNextLevel,
				environmentalImpact: mockUser.environmentalImpact || { treesPlanted: 0, co2Offset: 0, waterSaved: 0 },
				recentActivity: (mockUser.activityHistory || []).slice(0, 10),
			},
		});
	} catch (error) {
		console.error('dashboard-data fetch error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

