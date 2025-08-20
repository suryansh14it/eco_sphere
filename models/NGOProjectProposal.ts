import mongoose from 'mongoose';

const ngoProjectProposalSchema = new mongoose.Schema({
  // Project Information
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
  location: { 
    type: String, 
    required: true,
    trim: true
  },
  funding: { 
    type: String,
    required: true
  },
  timeline: { 
    type: String,
    default: ''
  },
  expectedImpact: {
    type: String,
    default: ''
  },
  
  // Researcher Information
  researcherName: { 
    type: String,
    required: true
  },
  researcherEmail: { 
    type: String, 
    required: true 
  },
  researcherPhone: {
    type: String,
    default: ''
  },
  researcherCommission: {
    type: String,
    required: true
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
  ngoCommission: {
    type: String,
    required: true
  },
  ngoCommissionAmount: {
    type: String,
    default: ''
  },
  ngoProjectFund: {
    type: String,
    default: ''
  },
  
  // Project Details
  categories: {
    type: [String],
    default: []
  },
  sdgGoals: {
    type: [String],
    default: []
  },
  keyMetrics: {
    type: Object,
    default: {}
  },
  milestones: {
    type: [Object],
    default: []
  },
  
  // NGO Specific Fields
  expectedStartDate: {
    type: String,
    default: ''
  },
  teamSize: {
    type: String,
    default: ''
  },
  experienceLevel: {
    type: String,
    enum: ['', 'beginner', 'intermediate', 'experienced', 'expert'],
    default: ''
  },
  proposedBudgetBreakdown: {
    type: String,
    default: ''
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  
  // Status and Metadata
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'negotiating', 'in_progress', 'completed'],
    default: 'submitted' 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: String 
  },
  reviewComments: { 
    type: String 
  },
  
  // Communication History
  communications: [{
    from: String,
    to: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['message', 'proposal_update', 'status_change'], default: 'message' }
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
ngoProjectProposalSchema.index({ ngoId: 1 });
ngoProjectProposalSchema.index({ researcherEmail: 1 });
ngoProjectProposalSchema.index({ status: 1 });
ngoProjectProposalSchema.index({ submittedAt: -1 });
ngoProjectProposalSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.NGOProjectProposal || 
  mongoose.model('NGOProjectProposal', ngoProjectProposalSchema);
