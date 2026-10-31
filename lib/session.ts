import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/User';

export const SESSION_COOKIE = 'user_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const SESSION_SECRET =
  process.env.JWT_SECRET ||
  process.env.AUTH_SECRET ||
  'eco-sphere-dev-secret-change-me';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Creates a signed JWT for the user. We no longer trust a `userId` sent in
 * the request body - every mutating API resolves the caller from this cookie.
 */
export function createSessionToken(user: Pick<IUser, '_id' | 'email' | 'name' | 'role'>): string {
  const payload: SessionPayload = {
    userId: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(payload, SESSION_SECRET, { expiresIn: SESSION_MAX_AGE });
}

export function setSessionCookie(response: NextResponse, user: Pick<IUser, '_id' | 'email' | 'name' | 'role'>) {
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    if (typeof decoded === 'string' || !decoded) return null;
    const payload = decoded as jwt.JwtPayload & Partial<SessionPayload>;
    if (!payload.userId) return null;
    return {
      userId: String(payload.userId),
      email: payload.email || '',
      name: payload.name || '',
      role: payload.role || '',
    };
  } catch {
    return null;
  }
}

/**
 * Reads the legacy JSON cookie (`{"userId": "..."}`) that older builds wrote,
 * so existing sessions keep working during the migration to signed JWTs.
 */
function readLegacySession(token: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(token);
    const userId = parsed?.userId || parsed?.id;
    if (!userId) return null;
    return { userId: String(userId), email: parsed.email || '', name: parsed.name || '', role: parsed.role || '' };
  } catch {
    return null;
  }
}

export async function getSessionUser(req: NextRequest): Promise<IUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = verifySessionToken(token) || readLegacySession(token);
  if (!session) return null;

  try {
    await connectDB();
    return await User.findById(session.userId).select('-password');
  } catch (error) {
    console.error('Failed to resolve session user:', error);
    return null;
  }
}

type Guard = { user: IUser; response?: never } | { user?: never; response: NextResponse };

export async function requireUser(req: NextRequest): Promise<Guard> {
  const user = await getSessionUser(req);
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, message: 'You must be signed in to do that.' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export async function requireRole(req: NextRequest, roles: string[]): Promise<Guard> {
  const result = await requireUser(req);
  if (!result.user) return result;

  if (!roles.includes(result.user.role)) {
    return {
      response: NextResponse.json(
        { success: false, message: 'You do not have permission to do that.' },
        { status: 403 }
      ),
    };
  }

  return result;
}
