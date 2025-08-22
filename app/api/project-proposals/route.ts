import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProjectProposal from '@/models/ProjectProposal';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/project-proposals - Starting request processing...');

    await connectDB();
    console.log('✅ Database connected successfully');

    const body = await request.json();
    console.log('📋 Received request body keys:', Object.keys(body));
    console.log('📋 Full request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    const { title, sdgFocus, location, description, researcherId, researcherEmail } = body;
    console.log('🔍 Validating required fields:', { title, sdgFocus, location, description, researcherId, researcherEmail });

    if (!title || !sdgFocus || !location || !description || !researcherId || !researcherEmail) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    console.log('✅ All required fields validated successfully');

    // Accept NGO data from form but don't store it in database
    // This allows any NGO to fetch all project proposals
    const {
      ngoId,
      ngoName,
      ngoEmail,
      ngoCommission,
      ngoCommissionAmount,
      ngoProjectFund
    } = body;

    console.log('📝 NGO data received (will not be stored):', { ngoId, ngoName, ngoEmail, ngoCommission });

    // Create project proposal document (without NGO-specific data in DB)
    console.log('🏗️ Creating project proposal document...');
    const projectProposal = new ProjectProposal({
      title: title.trim(),
      sdgFocus,
      location: location.trim(),
      fundingRequested: body.fundingRequested || '',
      description: description.trim(),
      duration: body.duration || '',
      commission: body.commission || '',
      selectedNGO: body.selectedNGO || null,
      researcherId,
      researcherEmail,
      researcherName: body.researcherName || '',
      researcherPhone: body.researcherPhone || '',
      researcherCommission: body.researcherCommission || '',
      // Don't store NGO-specific data - keep these empty so any NGO can access
      ngoId: '',
      ngoName: '',
      ngoEmail: '',
      ngoCommission: '',
      categories: body.categories || [],
      sdgGoals: body.sdgGoals || [],
      projectType: body.projectType || 'research-advised',
      proposalType: body.proposalType || 'researcher_to_ngo',
      expectedImpact: body.expectedImpact || '',
      keyMetrics: body.keyMetrics || {},
      milestones: body.milestones || [],
      status: 'submitted'
    });

    console.log('💾 Project proposal object created:', {
      title: projectProposal.title,
      researcherId: projectProposal.researcherId,
      researcherEmail: projectProposal.researcherEmail,
      location: projectProposal.location,
      fundingRequested: projectProposal.fundingRequested,
      ngoId: projectProposal.ngoId, // Should be empty
      ngoName: projectProposal.ngoName, // Should be empty
      status: projectProposal.status
    });

    // Save to database
    console.log('💾 Saving to database...');
    const result = await projectProposal.save();
    console.log('✅ Successfully saved to database with ID:', result._id);

    console.log('📤 Returning success response');
    return NextResponse.json(
      {
        success: true,
        proposalId: result._id,
        message: 'Project proposal submitted successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Error submitting project proposal:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to submit project proposal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/project-proposals - Starting request processing...');

    await connectDB();
    console.log('✅ Database connected successfully');

    const { searchParams } = new URL(request.url);
    const researcherId = searchParams.get('researcherId');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('📋 Query parameters:', { researcherId, limit });

    // Build query - allow filtering by researcherId if provided, otherwise return all
    let query = {};
    if (researcherId) {
      query = { researcherId };
    }
    console.log('🔍 Database query:', query);

    // Fetch all proposals (no NGO restrictions) so any NGO can see all available projects
    console.log('📊 Fetching proposals from database...');
    const proposals = await ProjectProposal.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .lean();

    console.log('📊 Found proposals count:', proposals.length);
    console.log('📊 Sample proposal data (first item):', proposals.length > 0 ? {
      id: proposals[0]._id,
      title: proposals[0].title,
      researcherEmail: proposals[0].researcherEmail,
      location: proposals[0].location,
      fundingRequested: proposals[0].fundingRequested,
      ngoId: proposals[0].ngoId,
      ngoName: proposals[0].ngoName,
      status: proposals[0].status,
      submittedAt: proposals[0].submittedAt
    } : 'No proposals found');

    console.log('📤 Returning success response with', proposals.length, 'proposals');
    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching project proposals:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project proposals'
      },
      { status: 500 }
    );
  }
}
