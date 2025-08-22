import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IActivityEvent {
  eventType: 'quiz_completion' | 'project_joined' | 'tree_planted' | 'issue_reported' | 'educational_content' | 'community_event';
  description: string;
  xpEarned: number;
  environmentalImpact?: {
    treesPlanted?: number;
    co2Offset?: number;
    waterSaved?: number;
  };
  timestamp: Date;
  relatedItemId?: string;
}

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'government' | 'researcher' | 'user' | 'ngo';
  isVerified: boolean;
  
  // User progression fields
  xpPoints: number;
  level: number;
  activityHistory: IActivityEvent[];
  environmentalImpact: {
    treesPlanted: number;
    co2Offset: number;
    waterSaved: number;
  };
  achievements: string[];
  completedItems: string[];
  
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
  addXP(amount: number, activityData: Partial<IActivityEvent>): Promise<IUser>;
  completeItem(itemId: string): Promise<boolean>;
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
    default: true  // Setting default to true for all new users
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
  
  // User progression fields
  xpPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  activityHistory: [{
    eventType: {
      type: String,
      enum: ['quiz_completion', 'project_joined', 'tree_planted', 'issue_reported', 'educational_content', 'community_event'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    xpEarned: {
      type: Number,
      required: true
    },
    environmentalImpact: {
      treesPlanted: Number,
      co2Offset: Number,
      waterSaved: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    relatedItemId: String
  }],
  environmentalImpact: {
    treesPlanted: {
      type: Number,
      default: 0
    },
    co2Offset: {
      type: Number,
      default: 0
    },
    waterSaved: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    type: String
  }],
  completedItems: [{
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

// Add XP and record activity
userSchema.methods.addXP = async function(
  amount: number, 
  activityData: Partial<IActivityEvent>
): Promise<IUser> {
  // Add XP points
  this.xpPoints += amount;
  
  // Update level based on XP using a more exponential curve
  // Base level is 1, then each level requires progressively more XP
  // Formula: level = 1 + sqrt(xp / 10)
  const oldLevel = this.level;
  const newLevel = Math.floor(1 + Math.sqrt(this.xpPoints / 10));
  const leveledUp = newLevel > oldLevel;
  this.level = newLevel;
  
  // Create activity record
  const activity = {
    eventType: activityData.eventType || 'educational_content',
    description: activityData.description || 'Earned XP',
    xpEarned: amount,
    timestamp: activityData.timestamp || new Date(),
    environmentalImpact: activityData.environmentalImpact,
    relatedItemId: activityData.relatedItemId,
    ...activityData // Include any additional fields passed in the activity data
  };
  
  // Add to activity history (limit to most recent 50 activities)
  this.activityHistory.unshift(activity); // Add to the beginning
  if (this.activityHistory.length > 50) {
    this.activityHistory = this.activityHistory.slice(0, 50);
  }
  
  // Update environmental impact if provided
  if (activity.environmentalImpact) {
    if (activity.environmentalImpact.treesPlanted) {
      this.environmentalImpact.treesPlanted += activity.environmentalImpact.treesPlanted;
    }
    if (activity.environmentalImpact.co2Offset) {
      this.environmentalImpact.co2Offset += activity.environmentalImpact.co2Offset;
    }
    if (activity.environmentalImpact.waterSaved) {
      this.environmentalImpact.waterSaved += activity.environmentalImpact.waterSaved;
    }
  }
  
  await this.save();
  
  return this as unknown as IUser;
};

// Mark an item as complete
userSchema.methods.completeItem = async function(itemId: string): Promise<boolean> {
  if (this.completedItems.includes(itemId)) {
    return false; // Already completed
  }
  
  this.completedItems.push(itemId);
  await this.save();
  
  return true;
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
