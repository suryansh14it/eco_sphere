import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Import the schemas from the existing API routes
const ngoLocalInitiativeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  projectFunding: { type: String, required: true },
  timeline: { type: String, required: true },
  ngoId: { type: String, required: true },
  ngoName: { type: String, required: true },
  ngoEmail: { type: String, required: true },
  ngoCommission: { type: String, required: true },
  department: { type: String, required: true },
  proposalSummary: { type: String, required: true },
  expectedImpact: { type: String },
  implementationPlan: { type: String },
  expectedStartDate: { type: String },
  teamSize: { type: String },
  experienceLevel: { type: String },
  additionalNotes: { type: String },
  categories: { type: [String], default: [] },
  sdgGoals: { type: [String], default: [] },
  keyMetrics: {
    volunteers: { type: String },
    beneficiaries: { type: String },
    areaImpact: { type: String },
    carbonReduction: { type: String }
  },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'submitted' }
});

const ngoResearcherProposalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  funding: { type: String, required: true },
  timeline: { type: String, required: true },
  researcherName: { type: String, required: true },
  researcherEmail: { type: String, required: true },
  researcherPhone: { type: String, required: true },
  researcherCommission: { type: String, required: true },
  ngoId: { type: String, required: true },
  ngoName: { type: String, required: true },
  ngoEmail: { type: String, required: true },
  ngoCommission: { type: String, required: true },
  department: { type: String, required: true },
  proposalSummary: { type: String, required: true },
  expectedStartDate: { type: String },
  teamSize: { type: String },
  experienceLevel: { type: String },
  proposedBudgetBreakdown: { type: String },
  additionalNotes: { type: String },
  categories: { type: [String], default: [] },
  sdgGoals: { type: [String], default: [] },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'submitted' }
});

const NGOLocalInitiative = mongoose.models.NGOLocalInitiative || 
  mongoose.model('NGOLocalInitiative', ngoLocalInitiativeSchema);

const NGOResearcherProposal = mongoose.models.NGOResearcherProposal || 
  mongoose.model('NGOResearcherProposal', ngoResearcherProposalSchema);

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const testLocalInitiatives = [
      {
        title: "Urban Tree Plantation Drive",
        description: "A comprehensive tree plantation initiative to increase green cover in urban areas, focusing on native species and community involvement.",
        location: "Mumbai, Maharashtra",
        projectFunding: "₹15L",
        timeline: "6 months",
        ngoId: "ngo-test-001",
        ngoName: "Green Mumbai Foundation",
        ngoEmail: "contact@greenmumbai.org",
        ngoCommission: "₹2L",
        department: "environmental",
        proposalSummary: "Urban tree plantation to combat air pollution and increase green cover in Mumbai's residential areas.",
        expectedImpact: "Plant 5000 trees, improve air quality, engage 500 volunteers",
        implementationPlan: "Phase-wise plantation in 10 residential areas with community participation",
        expectedStartDate: "January 2025",
        teamSize: "25 members",
        experienceLevel: "5 years in urban forestry",
        additionalNotes: "Partnership with local schools and resident associations",
        categories: ["Urban Forestry", "Air Quality", "Community Engagement"],
        sdgGoals: ["Climate Action", "Sustainable Cities"],
        keyMetrics: {
          volunteers: "500",
          beneficiaries: "10000",
          areaImpact: "50 hectares",
          carbonReduction: "100 tons"
        }
      },
      {
        title: "Community Solar Energy Project",
        description: "Installing solar panels in rural communities to provide clean energy access and reduce dependency on fossil fuels.",
        location: "Pune, Maharashtra",
        projectFunding: "₹25L",
        timeline: "8 months",
        ngoId: "ngo-test-002",
        ngoName: "Solar Villages Initiative",
        ngoEmail: "info@solarvillages.org",
        ngoCommission: "₹3L",
        department: "energy",
        proposalSummary: "Community-based solar energy installation for rural electrification and clean energy access.",
        expectedImpact: "Power 200 households, reduce carbon emissions, create local jobs",
        implementationPlan: "Install solar panels, train local technicians, establish maintenance system",
        expectedStartDate: "February 2025",
        teamSize: "20 members",
        experienceLevel: "7 years in renewable energy",
        additionalNotes: "Collaboration with local government and energy department",
        categories: ["Renewable Energy", "Rural Development", "Clean Technology"],
        sdgGoals: ["Affordable Clean Energy", "Climate Action"],
        keyMetrics: {
          volunteers: "100",
          beneficiaries: "800",
          areaImpact: "5 villages",
          carbonReduction: "200 tons"
        }
      }
    ];

    const testResearcherProposals = [
      {
        title: "Coastal Mangrove Restoration Project",
        description: "Research-backed mangrove restoration project to protect coastal areas from erosion and enhance marine biodiversity.",
        location: "Raigad, Maharashtra",
        funding: "₹30L",
        timeline: "12 months",
        researcherName: "Dr. Priya Sharma",
        researcherEmail: "priya.sharma@research.ac.in",
        researcherPhone: "+91-9876543210",
        researcherCommission: "₹4L",
        ngoId: "ngo-test-003",
        ngoName: "Coastal Conservation Society",
        ngoEmail: "info@coastalconservation.org",
        ngoCommission: "₹5L",
        department: "environmental",
        proposalSummary: "Scientific approach to mangrove restoration using native species and community-based monitoring.",
        expectedStartDate: "March 2025",
        teamSize: "15 researchers and field workers",
        experienceLevel: "10 years in marine ecology",
        proposedBudgetBreakdown: "Research: ₹10L, Implementation: ₹15L, Monitoring: ₹5L",
        additionalNotes: "Collaboration with marine biology department and local fishing communities",
        categories: ["Marine Conservation", "Coastal Protection", "Biodiversity"],
        sdgGoals: ["Life Below Water", "Climate Action", "Sustainable Communities"]
      },
      {
        title: "Sustainable Agriculture Research Initiative",
        description: "Research project to develop and implement sustainable farming practices that increase yield while reducing environmental impact.",
        location: "Nashik, Maharashtra",
        funding: "₹20L",
        timeline: "10 months",
        researcherName: "Dr. Rajesh Patel",
        researcherEmail: "rajesh.patel@agri.ac.in",
        researcherPhone: "+91-9876543211",
        researcherCommission: "₹3L",
        ngoId: "ngo-test-004",
        ngoName: "Sustainable Farming Alliance",
        ngoEmail: "contact@sustainablefarming.org",
        ngoCommission: "₹3L",
        department: "agriculture",
        proposalSummary: "Research-driven sustainable agriculture practices to improve farmer livelihoods and environmental health.",
        expectedStartDate: "April 2025",
        teamSize: "12 researchers and farmers",
        experienceLevel: "8 years in agricultural research",
        proposedBudgetBreakdown: "Research: ₹8L, Field trials: ₹10L, Training: ₹2L",
        additionalNotes: "Partnership with agricultural university and farmer cooperatives",
        categories: ["Sustainable Agriculture", "Food Security", "Rural Development"],
        sdgGoals: ["Zero Hunger", "Responsible Consumption", "Life on Land"]
      }
    ];

    // Insert test data
    const savedInitiatives = await NGOLocalInitiative.insertMany(testLocalInitiatives);
    const savedProposals = await NGOResearcherProposal.insertMany(testResearcherProposals);

    console.log(`✅ Added ${savedInitiatives.length} local initiatives and ${savedProposals.length} researcher proposals`);

    return NextResponse.json({
      success: true,
      message: 'Test data added successfully!',
      data: {
        localInitiatives: savedInitiatives.length,
        researcherProposals: savedProposals.length,
        total: savedInitiatives.length + savedProposals.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error adding test data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add test data',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to add test data to the database',
    instructions: 'Send a POST request to this endpoint to populate the database with sample projects'
  });
}
