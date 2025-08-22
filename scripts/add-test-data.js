// Script to add test data to the database for testing the government dashboard
// Run with: node scripts/add-test-data.js

const testLocalInitiative = {
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
};

const testResearcherProposal = {
  title: "Coastal Mangrove Restoration Project",
  description: "Research-backed mangrove restoration project to protect coastal areas from erosion and enhance marine biodiversity.",
  location: "Raigad, Maharashtra",
  funding: "₹25L",
  timeline: "12 months",
  researcherName: "Dr. Priya Sharma",
  researcherEmail: "priya.sharma@research.ac.in",
  researcherPhone: "+91-9876543210",
  researcherCommission: "₹3L",
  ngoId: "ngo-test-002",
  ngoName: "Coastal Conservation Society",
  ngoEmail: "info@coastalconservation.org",
  ngoCommission: "₹4L",
  department: "environmental",
  proposalSummary: "Scientific approach to mangrove restoration using native species and community-based monitoring.",
  expectedStartDate: "February 2025",
  teamSize: "15 researchers and field workers",
  experienceLevel: "10 years in marine ecology",
  proposedBudgetBreakdown: "Research: ₹8L, Implementation: ₹12L, Monitoring: ₹5L",
  additionalNotes: "Collaboration with marine biology department and local fishing communities",
  categories: ["Marine Conservation", "Coastal Protection", "Biodiversity"],
  sdgGoals: ["Life Below Water", "Climate Action", "Sustainable Communities"]
};

// Function to add test data via API calls
async function addTestData() {
  try {
    console.log('🌱 Adding test local initiative...');
    
    const localResponse = await fetch('http://localhost:3000/api/ngo/local-initiative', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLocalInitiative),
    });
    
    const localResult = await localResponse.json();
    console.log('✅ Local initiative result:', localResult);
    
    console.log('📝 Adding test researcher proposal...');
    
    const researcherResponse = await fetch('http://localhost:3000/api/ngo/researcher-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testResearcherProposal),
    });
    
    const researcherResult = await researcherResponse.json();
    console.log('✅ Researcher proposal result:', researcherResult);
    
    console.log('🎉 Test data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

// Instructions for manual testing
console.log(`
📋 Test Data Script
==================

To add test data to your database:

1. Make sure your development server is running (npm run dev)
2. Open browser console on any page
3. Copy and paste the following code:

// Add Local Initiative
fetch('/api/ngo/local-initiative', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(testLocalInitiative, null, 2)})
}).then(r => r.json()).then(console.log);

// Add Researcher Proposal  
fetch('/api/ngo/researcher-proposal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(testResearcherProposal, null, 2)})
}).then(r => r.json()).then(console.log);

4. Refresh the government dashboard to see the new projects
`);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testLocalInitiative, testResearcherProposal, addTestData };
}
