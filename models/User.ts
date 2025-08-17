import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'government' | 'researcher' | 'user' | 'ngo';
  isVerified: boolean;
  
  // Role-specific fields
  // Government Official
  department?: string;
  position?: string;
  governmentId?: string;
  
  // Researcher
  institution?: string;
  researchArea?: string;
  academicCredentials?: string;
  
  // Community Member
  location?: string;
  interests?: string[];
  
  // NGO/Organization
  organizationName?: string;
  registrationNumber?: string;
  focusAreas?: string[];
  
  // Common fields
  phone?: string;
  profileImage?: string;
  bio?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['government', 'researcher', 'user', 'ngo'],
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Government Official fields
  department: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'government';
    }
  },
  position: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'government';
    }
  },
  governmentId: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'government';
    }
  },
  
  // Researcher fields
  institution: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'researcher';
    }
  },
  researchArea: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'researcher';
    }
  },
  academicCredentials: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'researcher';
    }
  },
  
  // Community Member fields
  location: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'user';
    }
  },
  interests: [{
    type: String
  }],
  
  // NGO/Organization fields
  organizationName: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'ngo';
    }
  },
  registrationNumber: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'ngo';
    }
  },
  focusAreas: [{
    type: String
  }],
  
  // Common optional fields
  phone: String,
  profileImage: String,
  bio: String,
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
