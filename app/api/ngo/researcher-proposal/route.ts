import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Simple schema for NGO researcher proposals
const ngoResearcherProposalSchema = new mongoose.Schema({
  // Basic project info
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  funding: { type: String, required: true },
  timeline: { type: String, required: true },
  
  // Researcher info
  researcherName: { type: String, required: true },
  researcherEmail: { type: String, required: true },
  researcherPhone: { type: String, required: true },
  researcherCommission: { type: String, required: true },
  
  // NGO info
  ngoId: { type: String, required: true },
  ngoName: { type: String, required: true },
  ngoEmail: { type: String, required: true },
  ngoCommission: { type: String, required: true },
  
  // Government submission details
  department: { type: String, required: true },
  proposalSummary: { type: String, required: true },
  
  // Optional fields
  expectedStartDate: { type: String },
  teamSize: { type: String },
  experienceLevel: { type: String },
  proposedBudgetBreakdown: { type: String },
  additionalNotes: { type: String },
  
  // Categories and goals
  categories: { type: [String], default: [] },
  sdgGoals: { type: [String], default: [] },
  
  // Metadata
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'submitted' }
});

const NGOResearcherProposal = mongoose.models.NGOResearcherProposal || 
  mongoose.model('NGOResearcherProposal', ngoResearcherProposalSchema);

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Received researcher proposal submission...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Parse request body
    const data = await req.json();
    console.log('📋 Received data keys:', Object.keys(data));
    
    // Create new proposal
    const proposal = new NGOResearcherProposal(data);
    const savedProposal = await proposal.save();
    
    console.log('✅ Proposal saved with ID:', savedProposal._id);
    
    return NextResponse.json({
      success: true,
      message: 'Researcher proposal submitted successfully!',
      proposalId: savedProposal._id
    });
    
  } catch (error: any) {
    console.error('❌ Error saving researcher proposal:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to submit researcher proposal',
      error: error.toString()
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const ngoId = searchParams.get('ngoId');
    
    const query = ngoId ? { ngoId } : {};
    const proposals = await NGOResearcherProposal.find(query)
      .sort({ submittedAt: -1 })
      .limit(50);
    
    return NextResponse.json({
      success: true,
      proposals
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching proposals:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch proposals'
    }, { status: 500 });
  }
}
