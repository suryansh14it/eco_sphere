import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReport extends Document {
  projectId: mongoose.Types.ObjectId;
  projectName: string;
  date: Date;
  reportedBy: string;
  reporterId: string;
  submissionTime: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  progressSummary: string;
  tasksCompleted: string[];
  materialsUsed: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  challengesFaced: string;
  nextDayPlan: string;
  environmentalImpactMetrics: {
    wasteCollected?: string;
    treesPlanted?: number;
    areaRestored?: string;
    waterConserved?: string;
    emissionsReduced?: string;
    biodiversityAdded?: string;
    additionalMetrics?: Record<string, string>;
  };
  communityEngagement: {
    localParticipants: number;
    awarenessActivities: string[];
    stakeholderMeetings: string[];
  };
  governmentReportSubmitted: boolean;
  governmentReportId?: string;
  photos: string[];
  weatherConditions: string;
  fundingUtilization: {
    amountSpent: number;
    description: string;
    category: string;
    receipts?: string[];
  }[];
  contributorAttendance: {
    totalPresent: number;
    totalAbsent: number;
    totalPartial: number;
  };
  qualityChecks: {
    conductedBy: string;
    results: string;
    issues: string[];
    resolutionPlan: string;
  };
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
}

const dailyReportSchema = new Schema<IDailyReport>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project'
    },
    projectName: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    reportedBy: {
      type: String,
      required: true
    },
    reporterId: {
      type: String,
      required: true
    },
    submissionTime: {
      type: Date,
      default: Date.now
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    progressSummary: {
      type: String,
      required: true
    },
    tasksCompleted: {
      type: [String],
      default: []
    },
    materialsUsed: [
      {
        name: String,
        quantity: Number,
        unit: String
      }
    ],
    challengesFaced: {
      type: String,
      default: ''
    },
    nextDayPlan: {
      type: String,
      default: ''
    },
    environmentalImpactMetrics: {
      wasteCollected: String,
      treesPlanted: Number,
      areaRestored: String,
      waterConserved: String,
      emissionsReduced: String,
      biodiversityAdded: String,
      additionalMetrics: {
        type: Map,
        of: String
      }
    },
    communityEngagement: {
      localParticipants: {
        type: Number,
        default: 0
      },
      awarenessActivities: {
        type: [String],
        default: []
      },
      stakeholderMeetings: {
        type: [String],
        default: []
      }
    },
    governmentReportSubmitted: {
      type: Boolean,
      default: false
    },
    governmentReportId: String,
    photos: {
      type: [String],
      default: []
    },
    weatherConditions: {
      type: String,
      default: ''
    },
    fundingUtilization: [
      {
        amountSpent: Number,
        description: String,
        category: String,
        receipts: {
          type: [String],
          default: []
        }
      }
    ],
    contributorAttendance: {
      totalPresent: {
        type: Number,
        default: 0
      },
      totalAbsent: {
        type: Number,
        default: 0
      },
      totalPartial: {
        type: Number,
        default: 0
      }
    },
    qualityChecks: {
      conductedBy: String,
      results: String,
      issues: {
        type: [String],
        default: []
      },
      resolutionPlan: String
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed', 'approved'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

export const DailyReport = mongoose.models.DailyReport || 
  mongoose.model<IDailyReport>('DailyReport', dailyReportSchema);
