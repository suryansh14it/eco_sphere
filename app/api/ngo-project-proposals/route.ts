import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NGOProjectProposal from '@/models/NGOProjectProposal';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields for NGO proposal
    const { 
      title, 
      description, 
      funding, 
      location,
      researcherName,
      researcherEmail,
      researcherCommission,
      ngoCommission,
      ngoId,
      ngoName,
      ngoEmail
    } = body;
    
    if (!title || !description || !funding || !location || !researcherName || !researcherEmail || !ngoCommission || !ngoId || !ngoName || !ngoEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, funding, location, researcherName, researcherEmail, ngoCommission, ngoId, ngoName, ngoEmail' },
        { status: 400 }
      );
    }

    // Validate commission percentage
    const commissionPercent = parseFloat(ngoCommission);
    if (isNaN(commissionPercent) || commissionPercent < 0 || commissionPercent > 20) {
      return NextResponse.json(
        { error: 'NGO commission must be a number between 0 and 20' },
        { status: 400 }
      );
    }

    // Create NGO project proposal document
    const ngoProjectProposal = new NGOProjectProposal({
      // Project Information
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      funding,
      timeline: body.timeline || '',
      expectedImpact: body.expectedImpact || '',
      
      // Researcher Information
      researcherName: researcherName.trim(),
      researcherEmail: researcherEmail.trim(),
      researcherPhone: body.researcherPhone || '',
      researcherCommission: body.researcherCommission || '',
      
      // NGO Information
      ngoId,
      ngoName: ngoName.trim(),
      ngoEmail: ngoEmail.trim(),
      ngoCommission: ngoCommission.toString(),
      ngoCommissionAmount: body.ngoCommissionAmount || '',
      ngoProjectFund: body.ngoProjectFund || '',
      
      // Project Details
      categories: body.categories || [],
      sdgGoals: body.sdgGoals || [],
      keyMetrics: body.keyMetrics || {},
      milestones: body.milestones || [],
      
      // NGO Specific Fields
      expectedStartDate: body.expectedStartDate || '',
      teamSize: body.teamSize || '',
      experienceLevel: body.experienceLevel || '',
      proposedBudgetBreakdown: body.proposedBudgetBreakdown || '',
      additionalNotes: body.additionalNotes || '',
      
      // Status and Metadata
      status: 'submitted',
      submittedAt: new Date(),
      communications: [],
      
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to database
    const result = await ngoProjectProposal.save();

    return NextResponse.json(
      { 
        success: true, 
        proposalId: result._id,
        message: 'NGO project proposal submitted successfully',
        proposal: {
          id: result._id,
          title: result.title,
          status: result.status,
          submittedAt: result.submittedAt,
          researcherName: result.researcherName,
          ngoCommission: result.ngoCommission
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting NGO project proposal:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit proposal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');
    const researcherEmail = searchParams.get('researcherEmail');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query: any = {};
    
    if (ngoId) {
      query.ngoId = ngoId;
    }
    
    if (researcherEmail) {
      query.researcherEmail = researcherEmail;
    }
    
    if (status) {
      query.status = status;
    }
    
    const proposals = await NGOProjectProposal.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals: proposals.map(proposal => ({
        id: proposal._id,
        title: proposal.title,
        description: proposal.description,
        funding: proposal.funding,
        location: proposal.location,
        status: proposal.status,
        researcherName: proposal.researcherName,
        researcherEmail: proposal.researcherEmail,
        ngoName: proposal.ngoName,
        ngoCommission: proposal.ngoCommission,
        submittedAt: proposal.submittedAt,
        updatedAt: proposal.updatedAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching NGO proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
