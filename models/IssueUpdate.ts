import mongoose, { Document, Model } from 'mongoose';

export const ISSUE_UPDATE_TYPES = [
  'comment',
  'status_change',
  'official_response',
  'verification',
  'adoption',
  'escalation',
  'resolution',
] as const;

export type IssueUpdateType = (typeof ISSUE_UPDATE_TYPES)[number];

export interface IIssueUpdate extends Document {
  issueId: mongoose.Types.ObjectId;
  author: {
    id: string;
    name: string;
    role: string;
  };
  type: IssueUpdateType;
  body: string;
  fromStatus?: string;
  toStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const issueUpdateSchema = new mongoose.Schema<IIssueUpdate>(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    author: {
      id: { type: String, required: true },
      name: { type: String, default: 'Citizen' },
      role: { type: String, default: 'user' },
    },
    type: {
      type: String,
      enum: ISSUE_UPDATE_TYPES as unknown as string[],
      required: true,
      default: 'comment',
    },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    fromStatus: String,
    toStatus: String,
  },
  { timestamps: true }
);

issueUpdateSchema.index({ issueId: 1, createdAt: -1 });

const IssueUpdate: Model<IIssueUpdate> =
  mongoose.models.IssueUpdate ||
  mongoose.model<IIssueUpdate>('IssueUpdate', issueUpdateSchema);

export default IssueUpdate;
