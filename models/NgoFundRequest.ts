import mongoose from 'mongoose';

/**
 * NGO funding request (a.k.a. local initiative). The NGO asks the government
 * to fund a volunteer project it owns; the request carries evidence of
 * community backing (joined volunteers) and moves through government review:
 *
 *   submitted  -> NGO Requested   (pending government confirmation)
 *   approved   -> NGO Requested   (confirmed, payment pending)
 *   funded     -> Approved        (approved funding + payment released)
 */
export interface INgoFundRequest extends Document {
  // Linked volunteer project - the NGO can only ask the government for funds
  // for a project it has already opened to volunteers and that has joins.
  projectId: string;
  projectTitle: string;
  projectLocation: string;

  // Evidence of community backing: who already joined the volunteer project
  volunteerCount: number;
  volunteers: Array<{
    id: string;
    name: string;
    email: string;
    roleTitle: string;
    joinedAt: Date;
  }>;

  // Basic project info
  title: string;
  description: string;
  location: string;
  projectFunding: string;
  timeline: string;

  // NGO info
  ngoId: string;
  ngoName: string;
  ngoEmail: string;
  ngoCommission: string;

  // Government submission details
  department: string;
  proposalSummary: string;

  // Project details
  expectedImpact?: string;
  implementationPlan?: string;
  expectedStartDate?: string;
  teamSize?: string;
  experienceLevel?: string;
  additionalNotes?: string;

  // Categories and goals
  categories: string[];
  sdgGoals: string[];

  // Key metrics
  keyMetrics: {
    volunteers?: string;
    beneficiaries?: string;
    areaImpact?: string;
    carbonReduction?: string;
  };

  // Government decision trail
  approvedFunding?: string;
  approvedNote?: string;
  approvedByGov?: { id: string; name: string };
  approvedAt?: Date;

  paymentStatus: 'pending' | 'completed';
  paymentRef?: string;
  fundedAt?: Date;

  // Metadata
  submittedAt: Date;
  status: 'submitted' | 'approved' | 'funded';
}

const NgoFundRequestSchema = new mongoose.Schema<INgoFundRequest>(
  {
    // Linked volunteer project - the NGO can only ask the government for funds
    // for a project it has already opened to volunteers and that has joins.
    projectId: { type: String, default: '' },
    projectTitle: { type: String, default: '' },
    projectLocation: { type: String, default: '' },

    // Evidence of community backing: who already joined the volunteer project
    volunteerCount: { type: Number, default: 0 },
    volunteers: [
      {
        id: String,
        name: String,
        email: String,
        roleTitle: String,
        joinedAt: Date,
      },
    ],

    // Basic project info
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    projectFunding: { type: String, required: true },
    timeline: { type: String, required: true },

    // NGO info
    ngoId: { type: String, required: true },
    ngoName: { type: String, required: true },
    ngoEmail: { type: String, required: true },
    ngoCommission: { type: String, required: true },

    // Government submission details
    department: { type: String, required: true },
    proposalSummary: { type: String, required: true },

    // Project details
    expectedImpact: { type: String },
    implementationPlan: { type: String },
    expectedStartDate: { type: String },
    teamSize: { type: String },
    experienceLevel: { type: String },
    additionalNotes: { type: String },

    // Categories and goals
    categories: { type: [String], default: [] },
    sdgGoals: { type: [String], default: [] },

    // Key metrics
    keyMetrics: {
      volunteers: { type: String },
      beneficiaries: { type: String },
      areaImpact: { type: String },
      carbonReduction: { type: String },
    },

    // Government decision trail
    approvedFunding: { type: String, default: '' },
    approvedNote: { type: String, default: '' },
    approvedByGov: {
      id: { type: String, default: '' },
      name: { type: String, default: '' },
    },
    approvedAt: { type: Date },

    paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    paymentRef: { type: String, default: '' },
    fundedAt: { type: Date },

    // Metadata
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['submitted', 'approved', 'funded'], default: 'submitted' },
  },
  { timestamps: true }
);

NgoFundRequestSchema.index({ status: 1 });
NgoFundRequestSchema.index({ ngoId: 1 });
NgoFundRequestSchema.index({ submittedAt: -1 });

const NGOLocalInitiative =
  (mongoose.models.NGOLocalInitiative as mongoose.Model<INgoFundRequest>) ||
  mongoose.model<INgoFundRequest>('NGOLocalInitiative', NgoFundRequestSchema);

export default NGOLocalInitiative;
