import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('user_session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse session data
    let session;
    try {
      session = JSON.parse(sessionCookie);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // Get user from session
    const user = await getUserById(session.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        // Progress fields
        xpPoints: user.xpPoints || 0,
        level: user.level || 1,
        environmentalImpact: user.environmentalImpact || { treesPlanted: 0, co2Offset: 0, waterSaved: 0 },
        activityHistory: user.activityHistory || [],
        completedItems: user.completedItems || [],
        achievements: user.achievements || [],
        // Role-specific fields
        ...(user.role === 'government' && {
          department: user.department,
          position: user.position,
          governmentId: user.governmentId
        }),
        ...(user.role === 'researcher' && {
          institution: user.institution,
          researchArea: user.researchArea,
          academicCredentials: user.academicCredentials
        }),
        ...(user.role === 'user' && {
          location: user.location,
          interests: user.interests
        }),
        ...(user.role === 'ngo' && {
          organizationName: user.organizationName,
          registrationNumber: user.registrationNumber,
          focusAreas: user.focusAreas
        }),
        // Common fields
        phone: user.phone,
        profileImage: user.profileImage,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
