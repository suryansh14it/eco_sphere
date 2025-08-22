import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Simple schema for NGO local initiatives
const ngoLocalInitiativeSchema = new mongoose.Schema({
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
    carbonReduction: { type: String }
  },
  
  // Metadata
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'submitted' }
});

const NGOLocalInitiative = mongoose.models.NGOLocalInitiative || 
  mongoose.model('NGOLocalInitiative', ngoLocalInitiativeSchema);

export async function POST(req: NextRequest) {
  try {
    console.log('🌱 Received local initiative submission...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Parse request body
    const data = await req.json();
    console.log('📋 Received data keys:', Object.keys(data));
    
    // Create new initiative
    const initiative = new NGOLocalInitiative(data);
    const savedInitiative = await initiative.save();
    
    console.log('✅ Initiative saved with ID:', savedInitiative._id);
    
    return NextResponse.json({
      success: true,
      message: 'Local initiative submitted successfully!',
      initiativeId: savedInitiative._id
    });
    
  } catch (error: any) {
    console.error('❌ Error saving local initiative:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to submit local initiative',
      error: error.toString()
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const ngoId = searchParams.get('ngoId');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increased default limit

    // Build query - if no ngoId specified, fetch ALL initiatives
    const query = ngoId ? { ngoId } : {};
    console.log('🔍 Local initiatives query:', query, 'limit:', limit);

    const initiatives = await NGOLocalInitiative.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit);

    console.log(`📊 Found ${initiatives.length} local initiatives`);
    console.log('📋 Sample initiative:', initiatives[0] ? {
      id: initiatives[0]._id,
      title: initiatives[0].title,
      ngoName: initiatives[0].ngoName,
      location: initiatives[0].location
    } : 'No initiatives found');
    
    return NextResponse.json({
      success: true,
      initiatives
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching initiatives:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch initiatives'
    }, { status: 500 });
  }
}
