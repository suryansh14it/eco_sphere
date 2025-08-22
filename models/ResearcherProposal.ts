import mongoose from 'mongoose';

const researcherProposalSchema = new mongoose.Schema({
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
    required: true
  },
  expectedImpact: {
    type: String,
    required: true
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
    required: true
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
  
  // Research Specific Fields
  researchMethodology: {
    type: String,
    required: true
  },
  expectedFindings: {
    type: String,
    required: true
  },
  researchTeam: {
    type: [String],
    default: []
  },
  
  // Project Details
  categories: {
    type: [String],
    required: true
  },
  sdgGoals: {
    type: [String],
    required: true
  },
  keyMetrics: {
    type: Object,
    required: true
  },
  milestones: {
    type: [Object],
    required: true
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
  }]
}, {
  timestamps: true
});

// Create indexes for better query performance
researcherProposalSchema.index({ ngoId: 1 });
researcherProposalSchema.index({ researcherEmail: 1 });
researcherProposalSchema.index({ status: 1 });
researcherProposalSchema.index({ submittedAt: -1 });
researcherProposalSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.ResearcherProposal || 
  mongoose.model('ResearcherProposal', researcherProposalSchema);
