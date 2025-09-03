import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';

// GET /api/user/dashboard-data
// Returns progress/xp data for the authenticated user
export async function GET(request: NextRequest) {
       try {
	       // Get email from query params
	       const { searchParams } = new URL(request.url);
	       const email = searchParams.get('email');
	       if (!email) {
		       return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
	       }

	       await connectDB();
	       // Import User model dynamically to avoid Next.js import issues
	       const User = (await import('@/models/User')).default;
	       const user = await User.findOne({ email: email.toLowerCase() });
	       if (!user) {
		       return NextResponse.json({ error: 'User not found' }, { status: 404 });
	       }

	       // Compute next level threshold based on the leveling formula in models/User.ts
	       const level = user.level || 1;
	       const totalXp = user.xpPoints || 0;
	       const xpForNextLevel = Math.pow(level, 2) * 10;
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

