import mongoose from 'mongoose';

const projectProposalSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  sdgFocus: { 
    type: String, 
    required: false 
  },
  location: { 
    type: String, 
    required: true,
    trim: true
  },
  fundingRequested: { 
    type: String,
    default: ''
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  duration: { 
    type: String,
    default: ''
  },
  commission: { 
    type: String,
    default: ''
  },
  selectedNGO: {
    type: Object,
    default: null
  },
  researcherId: { 
    type: String, 
    required: false 
  },
  researcherEmail: { 
    type: String, 
    required: false 
  },
  researcherName: { 
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
  
  // NGO-specific fields
  ngoId: {
    type: String,
    required: false
  },
  ngoName: {
    type: String,
    default: ''
  },
  ngoEmail: {
    type: String,
    default: ''
  },
  ngoCommission: {
    type: String,
    default: ''
  },
  
  // Project categorization
  categories: {
    type: [String],
    default: []
  },
  sdgGoals: {
    type: [String],
    default: []
  },
  projectType: {
    type: String,
    enum: ['research-advised', 'community-initiative', 'government-proposal'],
    default: 'research-advised'
  },
  proposalType: {
    type: String,
    enum: ['researcher_to_ngo', 'ngo_to_researcher', 'ngo_to_government'],
    default: 'researcher_to_ngo'
  },
  
  // Additional project details
  expectedImpact: {
    type: String,
    default: ''
  },
  keyMetrics: {
    type: Object,
    default: {}
  },
  milestones: {
    type: [Object],
    default: []
  },
  
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'ngo_submitted'],
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
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // This automatically manages createdAt and updatedAt
});

// Create indexes for better query performance
projectProposalSchema.index({ researcherId: 1 });
projectProposalSchema.index({ ngoId: 1 });
projectProposalSchema.index({ status: 1 });
projectProposalSchema.index({ proposalType: 1 });
projectProposalSchema.index({ submittedAt: -1 });

export default mongoose.models.ProjectProposal || 
  mongoose.model('ProjectProposal', projectProposalSchema);
