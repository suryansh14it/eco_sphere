import mongoose, { Schema, Document } from 'mongoose';

/**
 * A volunteer role needs a concrete number of openings - NGOs commit to exact
 * numbers, and the community can see how many slots are still open.
 */
export interface IRole {
  /** Embedded subdocs get an ObjectId automatically. */
  _id?: string;
  title: string;
  description?: string;
  slots: number;
}

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  ngo: {
    id: string;
    name: string;
    email: string;
  };
  location?: {
    address?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  startsAt?: Date;
  endsAt?: Date;
  roles: IRole[];
  status: 'open' | 'closed' | 'completed';
  /** What the NGO typed, kept for audit. */
  referralId: string;
  referralVerifiedAt: Date;
  /** Linked reports on the public issue board. */
  issueIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export const PROJECT_CATEGORIES = [
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

export const PROJECT_STATUSES = ['open', 'closed', 'completed'] as const;

const RoleSchema = new Schema<IRole>(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500 },
    slots: { type: Number, required: true, min: 1, max: 500 },
  },
  { _id: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: {
      type: String,
      required: true,
      enum: [...PROJECT_CATEGORIES],
    },
    ngo: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    location: {
      address: { type: String, trim: true, maxlength: 300 },
      district: { type: String, trim: true, maxlength: 120 },
      state: { type: String, trim: true, maxlength: 120 },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    startsAt: { type: Date },
    endsAt: { type: Date },
    roles: { type: [RoleSchema], validate: (v: IRole[]) => Array.isArray(v) && v.length > 0 },
    status: {
      type: String,
      enum: [...PROJECT_STATUSES],
      default: 'open',
      required: true,
    },
    referralId: { type: String, required: true },
    referralVerifiedAt: { type: Date, required: true },
    issueIds: [{ type: Schema.Types.ObjectId, ref: 'Issue' }],
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ 'ngo.id': 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project ||
  mongoose.model<IProject>('Project', ProjectSchema);
