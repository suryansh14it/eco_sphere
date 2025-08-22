import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    // First ensure database connection
    await connectDB();
    
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!password?.trim()) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(email.trim().toLowerCase(), password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified (if you're using email verification)
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in' },
        { status: 403 }
      );
    }

    // Create response with user data (no session cookies)
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          xpPoints: user.xpPoints || 0,
          level: user.level || 1,
          environmentalImpact: user.environmentalImpact || {
            treesPlanted: 0,
            co2Offset: 0,
            waterSaved: 0
          }
        },
        redirectTo: `/${user.role}`
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred during login'
      },
      { status: 500 }
    );
  }
}
