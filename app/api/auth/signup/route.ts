import { NextRequest, NextResponse } from 'next/server';
import { emailExists, createUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      confirmPassword,
      name,
      role,
      // Government fields
      department,
      position,
      governmentId,
      // Researcher fields
      institution,
      researchArea,
      academicCredentials,
      // User fields
      location,
      interests,
      // NGO fields
      organizationName,
      registrationNumber,
      focusAreas,
      // Optional fields
      phone,
      bio
    } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const userExists = await emailExists(email);
    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate role-specific fields
    const roleValidation = validateRoleFields(role, body);
    if (roleValidation.error) {
      return NextResponse.json(
        { error: roleValidation.error },
        { status: 400 }
      );
    }

    // Create user data object
    const userData: any = {
      email: email.toLowerCase(),
      password,
      name,
      role,
      phone,
      bio
    };

    // Add role-specific fields
    if (role === 'government') {
      userData.department = department;
      userData.position = position;
      userData.governmentId = governmentId;
    } else if (role === 'researcher') {
      userData.institution = institution;
      userData.researchArea = researchArea;
      userData.academicCredentials = academicCredentials;
    } else if (role === 'user') {
      userData.location = location;
      userData.interests = interests || [];
    } else if (role === 'ngo') {
      userData.organizationName = organizationName;
      userData.registrationNumber = registrationNumber;
      userData.focusAreas = focusAreas || [];
    }

    // Create user
    const user = await createUser(userData);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create session
    const session = {
      userId: user._id.toString(),
      role: user.role
    };

    // Create response
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified
        },
        redirectTo: `/${user.role}` // Add redirect info
      },
      { status: 201 }
    );

    // Store session data in a cookie
    response.cookies.set('user_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateRoleFields(role: string, body: any) {
  switch (role) {
    case 'government':
      if (!body.department || !body.position || !body.governmentId) {
        return { error: 'Department, position, and government ID are required for government officials' };
      }
      break;
    case 'researcher':
      if (!body.institution || !body.researchArea || !body.academicCredentials) {
        return { error: 'Institution, research area, and academic credentials are required for researchers' };
      }
      break;
    case 'user':
      if (!body.location) {
        return { error: 'Location is required for community members' };
      }
      break;
    case 'ngo':
      if (!body.organizationName || !body.registrationNumber) {
        return { error: 'Organization name and registration number are required for NGOs' };
      }
      break;
    default:
      return { error: 'Invalid role specified' };
  }
  return { error: null };
}
