import mongoose from 'mongoose';

const governmentProposalSchema = new mongoose.Schema({
  // Proposal Information
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  department: { 
    type: String, 
    required: true,
    enum: ['environmental', 'urban', 'energy', 'health', 'agriculture', 'education', 'transport', 'other']
  },
  fundingRequested: { 
    type: String,
    required: true
  },
  proposalSummary: {
    type: String,
    required: true,
    trim: true
  },
  
  // Proposal Type and Source
  proposalType: {
    type: String,
    enum: ['researcher-advised', 'local-initiative'],
    required: true
  },
  
  // Researcher Information (for researcher-advised proposals)
  researcherName: {
    type: String,
    default: ''
  },
  researcherEmail: {
    type: String,
    default: ''
  },
  researcherPhone: {
    type: String,
    default: ''
  },
  researcherCommission: {
    type: String,
    default: ''
  },
  originalResearchProject: {
    type: Object,
    default: null
  },
  
  // NGO Information
  ngoId: {
    type: String,
    required: true
  },
  ngoName: {
    type: String,
    required: true
  },
  ngoEmail: {
    type: String,
    required: true
  },
  ngoRegistrationNumber: {
    type: String,
    default: ''
  },
  ngoExperience: {
    type: String,
    default: ''
  },
  
  // Project Details
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: ''
  },
  beneficiaries: {
    type: String,
    default: ''
  },
  expectedOutcomes: {
    type: [String],
    default: []
  },
  sustainabilityPlan: {
    type: String,
    default: ''
  },
  
  // Budget Information
  budgetBreakdown: {
    type: Object,
    default: {}
  },
  coFunding: {
    type: String,
    default: ''
  },
  
  // Supporting Documents
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Status and Review
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'requires_modification', 'in_progress', 'completed'],
    default: 'submitted' 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Government Review
  assignedOfficer: {
    type: String,
    default: ''
  },
  reviewComments: {
    type: String,
    default: ''
  },
  reviewedAt: { 
    type: Date 
  },
  approvalAmount: {
    type: String,
    default: ''
  },
  
  // Payment Information
  paymentDetails: {
    upiId: {
      type: String,
      default: ''
    },
    qrCode: {
      type: String,
      default: ''
    },
    totalAmount: {
      type: String,
      default: ''
    },
    projectAmount: {
      type: String,
      default: ''
    },
    ngoCommission: {
      type: String,
      default: ''
    },
    researcherCommission: {
      type: String,
      default: ''
    },
    ngoCommissionPercent: {
      type: Number,
      default: 0
    },
    researcherCommissionPercent: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    receiptUrl: {
      type: String,
      default: ''
    },
    transactionId: {
      type: String,
      default: ''
    },
    paymentDate: {
      type: Date
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verificationNotes: {
      type: String,
      default: ''
    }
  },

  // Timeline
  submittedAt: {
    type: Date,
    default: Date.now
  },
  expectedDecisionDate: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  
  // Communication History
  communications: [{
    from: String,
    to: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['message', 'request_info', 'status_update'], default: 'message' }
  }],
  
  // Monitoring and Evaluation
  milestones: [{
    name: String,
    description: String,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'delayed'], default: 'pending' },
    completedAt: Date
  }],
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
governmentProposalSchema.index({ ngoId: 1 });
governmentProposalSchema.index({ department: 1 });
governmentProposalSchema.index({ status: 1 });
governmentProposalSchema.index({ priority: 1 });
governmentProposalSchema.index({ submittedAt: -1 });
governmentProposalSchema.index({ assignedOfficer: 1 });
governmentProposalSchema.index({ title: 'text', description: 'text', proposalSummary: 'text' });

export default mongoose.models.GovernmentProposal || 
  mongoose.model('GovernmentProposal', governmentProposalSchema);
