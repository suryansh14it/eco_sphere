import bcrypt from 'bcryptjs';
import User, { IUser } from '@/models/User';
import connectDB from '@/lib/mongodb';

/**
 * Simplified authentication function - no token handling, just direct DB checks
 * @param email User email
 * @param password User password
 * @returns User object or null if authentication failed
 */
export async function authenticateUser(email: string, password: string): Promise<IUser | null> {
  try {
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found with email:', email);
      return null;
    }

    // Check password using the method defined in the User model
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Password validation failed for email:', email);
      return null;
    }

    // Return user without password
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Create a new user
 * @param userData User data for registration
 * @returns Created user or null if registration failed
 */
export async function createUser(userData: any): Promise<IUser | null> {
  try {
    await connectDB();

    // Create user without hashing password here - the User model's pre-save hook will handle it
    const user = new User(userData);
    await user.save();
    
    // Return user without password
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return user;
  } catch (error) {
    console.error('User creation error:', error);
    return null;
  }
}

/**
 * Get user by their ID
 * @param userId User ID
 * @returns User object or null if not found
 */
export async function getUserById(userId: string): Promise<IUser | null> {
  try {
    await connectDB();
    const user = await User.findById(userId).select('-password');
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Check if email already exists in database
 * @param email Email to check
 * @returns Boolean indicating if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  } catch (error) {
    console.error('Email check error:', error);
    return false;
  }
}
