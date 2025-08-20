import mongoose, { Schema, Document } from 'mongoose';

// Attendance record for a contributor at a project site
export interface IAttendanceRecord extends Document {
  projectId: mongoose.Types.ObjectId;
  contributorId: string;
  contributorName: string;
  date: Date;
  entryTime: Date;
  exitTime: Date | null;
  gpsLocationEntry: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  gpsLocationExit: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  entryPhotoUrl: string; // URL to the photo taken at entry
  exitPhotoUrl: string | null; // URL to the photo taken at exit
  status: 'present' | 'absent' | 'partial';
  notes: string;
  workHours: number | null;
  verifiedBy: string | null; // NGO admin who verified the attendance
  aiVerification?: {
    verified: boolean;
    confidence: string;
    reason: string;
    analysis: any;
    timestamp: Date;
  } | null; // AI verification results for location/photo verification
}

// Daily contribution record for each contributor
export interface IDailyContribution extends Document {
  projectId: mongoose.Types.ObjectId;
  contributorId: string;
  contributorName: string;
  date: Date;
  hoursWorked: number;
  tasksCompleted: string[];
  skillsApplied: string[];
  performanceRating: number; // 1-5 rating
  xpPointsEarned: number;
  notes: string;
  verifiedBy: string | null; // NGO admin who verified the contribution
}

const attendanceSchema = new Schema<IAttendanceRecord>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project'
    },
    contributorId: {
      type: String,
      required: true
    },
    contributorName: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    entryTime: {
      type: Date,
      required: true
    },
    exitTime: {
      type: Date,
      default: null
    },
    gpsLocationEntry: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    gpsLocationExit: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    entryPhotoUrl: {
      type: String,
      required: true
    },
    exitPhotoUrl: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'partial'],
      default: 'present'
    },
    notes: {
      type: String,
      default: ''
    },
    workHours: {
      type: Number,
      default: null
    },
    verifiedBy: {
      type: String,
      default: null
    },
    aiVerification: {
      verified: Boolean,
      confidence: String,
      reason: String,
      analysis: Schema.Types.Mixed,
      timestamp: Date
    }
  },
  { timestamps: true }
);

const contributionSchema = new Schema<IDailyContribution>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project'
    },
    contributorId: {
      type: String,
      required: true
    },
    contributorName: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    hoursWorked: {
      type: Number,
      required: true
    },
    tasksCompleted: {
      type: [String],
      default: []
    },
    skillsApplied: {
      type: [String],
      default: []
    },
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    xpPointsEarned: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    },
    verifiedBy: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export const AttendanceRecord = mongoose.models.AttendanceRecord || 
  mongoose.model<IAttendanceRecord>('AttendanceRecord', attendanceSchema);

export const DailyContribution = mongoose.models.DailyContribution ||
  mongoose.model<IDailyContribution>('DailyContribution', contributionSchema);
