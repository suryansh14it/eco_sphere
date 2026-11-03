import mongoose, { Schema, Document } from 'mongoose';

/**
 * Management overlay for an undertaken project. NGOs manage two kinds of
 * undertakings, unified under one document so the live/completed lists,
 * media, notices and attendance all behave the same way:
 *
 *  - `volunteer-<ProjectId>` : a volunteer project the NGO posted
 *  - `issue-<IssueId>`       : a public issue the NGO adopted
 */
export interface IManagedMedia {
  kind: 'image' | 'video';
  url: string;
  name?: string;
  uploadedAt: Date;
}

export interface IManagedDocument {
  title: string;
  url?: string;
  uploadedAt: Date;
}

export interface IManagedNotice {
  title: string;
  body: string;
  createdAt: Date;
}

export interface IManagedProject extends Document {
  /** `${kind}-${refId}` — stable identifier used in URLs and APIs. */
  key: string;
  ngoId: string;
  kind: 'volunteer' | 'issue';
  refId: string;
  /** 0-100, moved by the NGO through the progress slider. */
  progress: number;
  /** Set when the NGO marks the project completed. */
  completedAt: Date | null;
  completedSummary?: string;
  media: IManagedMedia[];
  documents: IManagedDocument[];
  notices: IManagedNotice[];
  /** Community members excluded from the roster by the NGO. */
  removedUserIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Date-wise attendance for one undertaking. One document per project-day;
 * `xpAwarded` stops double XP when the NGO re-marks a date.
 */
export interface IAttendanceMark {
  userId: string;
  name: string;
  roleId?: string;
  present: boolean;
  xpAwarded: boolean;
}

export interface IManagedAttendance extends Document {
  key: string;
  /** YYYY-MM-DD */
  date: string;
  markedBy: string;
  records: IAttendanceMark[];
  createdAt: Date;
  updatedAt: Date;
}

const ManagedProjectSchema = new Schema<IManagedProject>(
  {
    key: { type: String, required: true, unique: true, index: true },
    ngoId: { type: String, required: true, index: true },
    kind: { type: String, enum: ['volunteer', 'issue'], required: true },
    refId: { type: String, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date, default: null },
    completedSummary: { type: String, default: '' },
    media: [
      {
        kind: { type: String, enum: ['image', 'video'], default: 'image' },
        url: { type: String, required: true },
        name: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    documents: [
      {
        title: { type: String, required: true },
        url: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notices: [
      {
        title: { type: String, required: true },
        body: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    removedUserIds: [{ type: String }],
  },
  { timestamps: true }
);

const ManagedAttendanceSchema = new Schema<IManagedAttendance>(
  {
    key: { type: String, required: true },
    date: { type: String, required: true },
    markedBy: { type: String, default: '' },
    records: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        roleId: { type: String, default: '' },
        present: { type: Boolean, required: true },
        xpAwarded: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

ManagedAttendanceSchema.index({ key: 1, date: 1 }, { unique: true });

export default mongoose.models.ManagedProject ||
  mongoose.model<IManagedProject>('ManagedProject', ManagedProjectSchema);

export const ManagedAttendance =
  mongoose.models.ManagedAttendance ||
  mongoose.model<IManagedAttendance>('ManagedAttendance', ManagedAttendanceSchema);
