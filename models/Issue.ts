import mongoose, { Document, Model } from 'mongoose';

export const ISSUE_CATEGORIES = [
  'pollution',
  'waste',
  'deforestation',
  'industrial',
  'water',
  'air',
  'wildlife',
  'encroachment',
  'other',
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const ISSUE_STATUSES = [
  'reported', // citizen submitted, waiting for a signal
  'verified', // AI or community confirmed it is real
  'triaged', // government acknowledged and routed it
  'assigned', // an NGO adopted it
  'in_progress', // work started
  'resolved', // fix reported
  'rejected', // not a genuine/actionable issue
  'duplicate', // merged into another report
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface IIssueMedia {
  dataUrl: string;
  mimeType: string;
  size: number;
}

export interface IIssueConfirmation {
  userId: string;
  name: string;
  type: 'confirm' | 'still_happening' | 'fixed';
  createdAt: Date;
}

export interface IIssueValidation {
  isValid: boolean;
  severity: number;
  confidence: number;
  impactType: string;
  impactDescription: string;
  shouldEscalate: boolean;
  feedback: string;
  suggestions: string[];
  model: string;
  validatedAt: Date | null;
}

export interface IIssue extends Document {
  reporter: {
    id: string;
    name: string;
    role: string;
  };
  title: string;
  description: string;
  category: string;
  severity: number;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
    district?: string;
    state?: string;
  };
  media: IIssueMedia[];
  mediaCount: number;
  status: IssueStatus;
  aiValidation?: IIssueValidation;
  confirmations: IIssueConfirmation[];
  confirmCount: number;
  stillHappeningCount: number;
  fixedCount: number;
  assignedNgo?: {
    id: string;
    name: string;
    email: string;
  };
  assignedDepartment?: string;
  assignedOfficial?: {
    id: string;
    name: string;
  };
  linkedProjectId?: string;
  duplicateOf?: mongoose.Types.ObjectId;
  duplicateCount: number;
  escalated: boolean;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new mongoose.Schema<IIssue>(
  {
    reporter: {
      id: { type: String, required: true, index: true },
      name: { type: String, default: 'Anonymous' },
      role: { type: String, default: 'user' },
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: ISSUE_CATEGORIES as unknown as string[],
      default: 'other',
      index: true,
    },
    severity: { type: Number, min: 1, max: 10, default: 5 },

    location: {
      address: { type: String, required: true, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
    },

    media: [
      {
        dataUrl: { type: String, required: true },
        mimeType: { type: String, default: 'image/jpeg' },
        size: { type: Number, default: 0 },
      },
    ],
    mediaCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ISSUE_STATUSES as unknown as string[],
      default: 'reported',
      index: true,
    },

    aiValidation: {
      isValid: Boolean,
      severity: Number,
      confidence: Number,
      impactType: String,
      impactDescription: String,
      shouldEscalate: Boolean,
      feedback: String,
      suggestions: [String],
      model: String,
      validatedAt: Date,
    },

    confirmations: [
      {
        userId: { type: String, required: true },
        name: { type: String, default: 'Citizen' },
        type: {
          type: String,
          enum: ['confirm', 'still_happening', 'fixed'],
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    confirmCount: { type: Number, default: 0 },
    stillHappeningCount: { type: Number, default: 0 },
    fixedCount: { type: Number, default: 0 },

    assignedNgo: {
      id: String,
      name: String,
      email: String,
    },
    assignedDepartment: String,
    assignedOfficial: {
      id: String,
      name: String,
    },
    linkedProjectId: String,

    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    duplicateCount: { type: Number, default: 0 },
    escalated: { type: Boolean, default: false },

    acknowledgedAt: Date,
    resolvedAt: Date,
  },
  { timestamps: true }
);

issueSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
issueSchema.index({ title: 'text', description: 'text' });
issueSchema.index({ createdAt: -1 });

const Issue: Model<IIssue> =
  mongoose.models.Issue || mongoose.model<IIssue>('Issue', issueSchema);

export default Issue;
