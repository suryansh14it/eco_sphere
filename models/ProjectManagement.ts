import mongoose, { Schema, Document } from 'mongoose';

// Daily attendance record for project contributors
interface Attendance {
  contributorId: string;
  contributorName: string;
  date: Date;
  entryTime: Date;
  exitTime: Date | null;
  gpsLocationEntry: {
    latitude: number;
    longitude: number;
  };
  gpsLocationExit: {
    latitude: number;
    longitude: number;
  } | null;
  photoUrl: string; // URL to the photo taken at entry
  exitPhotoUrl: string | null; // URL to the photo taken at exit
  status: 'present' | 'absent' | 'partial';
  notes: string;
}

// Daily contribution record for each contributor
interface Contribution {
  contributorId: string;
  contributorName: string;
  date: Date;
  hoursWorked: number;
  tasksCompleted: string[];
  skillsApplied: string[];
  performanceRating: number; // 1-5 rating
  notes: string;
}

// Daily project report
interface DailyReport {
  date: Date;
  reportedBy: string;
  reporterId: string;
  submissionTime: Date;
  progressSummary: string;
  tasksCompleted: string[];
  materialsUsed: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  challengesFaced: string;
  nextDayPlan: string;
  environmentalImpactMetrics: Record<string, string>;
  governmentReportSubmitted: boolean;
  governmentReportId?: string;
  photos: string[]; // URLs to photos taken during the day
  weatherConditions: string;
  fundingUtilization: {
    amountSpent: number;
    description: string;
    receipts: string[]; // URLs to receipt photos
  }[];
}

// Project management document interface
export interface IProjectManagement extends Document {
  projectId: mongoose.Types.ObjectId;
  projectName: string;
  ngoId: string;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  contributors: {
    id: string;
    name: string;
    role: string;
    contactInfo: string;
    joinDate: Date;
    endDate?: Date;
    totalHoursContributed: number;
    xpPoints: number;
  }[];
  attendanceRecords: Attendance[];
  contributionRecords: Contribution[];
  dailyReports: DailyReport[];
  cumulativeStats: {
    totalDays: number;
    completedDays: number;
    attendanceRate: number;
    averageDailyProgress: number;
    totalXPAwarded: number;
    fundingUtilized: number;
    fundingTotal: number;
    environmentalImpact: Record<string, string>;
  };
  milestones: {
    name: string;
    description: string;
    targetDate: Date;
    completionDate?: Date;
    status: 'pending' | 'completed' | 'overdue';
  }[];
  completionSummary?: {
    date: Date;
    overallSuccess: number; // 1-5 rating
    keyAchievements: string[];
    challengesOvercome: string[];
    lessonsLearned: string[];
    futureRecommendations: string;
    finalReport: string; // URL to final report document
  };
}

const ProjectManagementSchema = new Schema<IProjectManagement>(
  {
    projectId: { type: Schema.Types.ObjectId, required: true, ref: 'GovernmentProposal' },
    projectName: { type: String, required: true },
    ngoId: { type: String, required: true },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date, required: true },
    actualEndDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active', required: true },
    contributors: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, required: true },
        contactInfo: { type: String, required: true },
        joinDate: { type: Date, required: true },
        endDate: { type: Date },
        totalHoursContributed: { type: Number, default: 0 },
        xpPoints: { type: Number, default: 0 },
      },
    ],
    attendanceRecords: [
      {
        contributorId: { type: String, required: true },
        contributorName: { type: String, required: true },
        date: { type: Date, required: true },
        entryTime: { type: Date, required: true },
        exitTime: { type: Date },
        gpsLocationEntry: {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
        gpsLocationExit: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
        photoUrl: { type: String, required: true },
        exitPhotoUrl: { type: String },
        status: { type: String, enum: ['present', 'absent', 'partial'], required: true },
        notes: { type: String },
      },
    ],
    contributionRecords: [
      {
        contributorId: { type: String, required: true },
        contributorName: { type: String, required: true },
        date: { type: Date, required: true },
        hoursWorked: { type: Number, required: true },
        tasksCompleted: [{ type: String }],
        skillsApplied: [{ type: String }],
        performanceRating: { type: Number, min: 1, max: 5, required: true },
        notes: { type: String },
      },
    ],
    dailyReports: [
      {
        date: { type: Date, required: true },
        reportedBy: { type: String, required: true },
        reporterId: { type: String, required: true },
        submissionTime: { type: Date, required: true },
        progressSummary: { type: String, required: true },
        tasksCompleted: [{ type: String }],
        materialsUsed: [
          {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            unit: { type: String, required: true },
          },
        ],
        challengesFaced: { type: String },
        nextDayPlan: { type: String },
        environmentalImpactMetrics: { type: Schema.Types.Mixed },
        governmentReportSubmitted: { type: Boolean, default: false },
        governmentReportId: { type: String },
        photos: [{ type: String }],
        weatherConditions: { type: String },
        fundingUtilization: [
          {
            amountSpent: { type: Number, required: true },
            description: { type: String, required: true },
            receipts: [{ type: String }],
          },
        ],
      },
    ],
    cumulativeStats: {
      totalDays: { type: Number, default: 0 },
      completedDays: { type: Number, default: 0 },
      attendanceRate: { type: Number, default: 0 },
      averageDailyProgress: { type: Number, default: 0 },
      totalXPAwarded: { type: Number, default: 0 },
      fundingUtilized: { type: Number, default: 0 },
      fundingTotal: { type: Number, default: 0 },
      environmentalImpact: { type: Schema.Types.Mixed },
    },
    milestones: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        targetDate: { type: Date, required: true },
        completionDate: { type: Date },
        status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending', required: true },
      },
    ],
    completionSummary: {
      date: { type: Date },
      overallSuccess: { type: Number, min: 1, max: 5 },
      keyAchievements: [{ type: String }],
      challengesOvercome: [{ type: String }],
      lessonsLearned: [{ type: String }],
      futureRecommendations: { type: String },
      finalReport: { type: String },
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
ProjectManagementSchema.index({ projectId: 1 });
ProjectManagementSchema.index({ ngoId: 1 });
ProjectManagementSchema.index({ status: 1 });
ProjectManagementSchema.index({ 'contributors.id': 1 });
ProjectManagementSchema.index({ 'attendanceRecords.date': 1 });
ProjectManagementSchema.index({ 'dailyReports.date': 1 });

export default mongoose.models.ProjectManagement || 
  mongoose.model<IProjectManagement>('ProjectManagement', ProjectManagementSchema);
