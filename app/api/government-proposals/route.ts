import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GovernmentProposal from '@/models/GovernmentProposal';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields for Government proposal
    const { 
      title, 
      description, 
      department,
      fundingRequested,
      proposalSummary,
      ngoId,
      ngoName,
      ngoEmail,
      location
    } = body;
    
    if (!title || !description || !department || !fundingRequested || !proposalSummary || !ngoId || !ngoName || !ngoEmail || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, department, fundingRequested, proposalSummary, ngoId, ngoName, ngoEmail, location' },
        { status: 400 }
      );
    }

    // Validate department
    const validDepartments = ['environmental', 'urban', 'energy', 'health', 'agriculture', 'education', 'transport', 'other'];
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { error: 'Invalid department. Must be one of: ' + validDepartments.join(', ') },
        { status: 400 }
      );
    }

    // Create government proposal document
    const governmentProposal = new GovernmentProposal({
      // Proposal Information
      title: title.trim(),
      description: description.trim(),
      department,
      fundingRequested,
      proposalSummary: proposalSummary.trim(),
      
      // NGO Information
      ngoId,
      ngoName: ngoName.trim(),
      ngoEmail: ngoEmail.trim(),
      ngoRegistrationNumber: body.ngoRegistrationNumber || '',
      ngoExperience: body.ngoExperience || '',
      
      // Project Details
      location: location.trim(),
      duration: body.duration || '',
      beneficiaries: body.beneficiaries || '',
      expectedOutcomes: body.expectedOutcomes || [],
      sustainabilityPlan: body.sustainabilityPlan || '',
      
      // Budget Information
      budgetBreakdown: body.budgetBreakdown || {},
      coFunding: body.coFunding || '',
      
      // Supporting Documents
      documents: body.documents || [],
      
      // Status and Review
      status: 'submitted',
      priority: body.priority || 'medium',
      
      // Timeline
      submittedAt: new Date(),
      expectedDecisionDate: body.expectedDecisionDate ? new Date(body.expectedDecisionDate) : undefined,
      
      // Communication and Monitoring
      communications: [],
      milestones: body.milestones || [],
      
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to database
    const result = await governmentProposal.save();

    return NextResponse.json(
      { 
        success: true, 
        proposalId: result._id,
        message: 'Government proposal submitted successfully',
        proposal: {
          id: result._id,
          title: result.title,
          department: result.department,
          status: result.status,
          fundingRequested: result.fundingRequested,
          submittedAt: result.submittedAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting government proposal:', error);
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
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query: any = {};
    
    if (ngoId) {
      query.ngoId = ngoId;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    const proposals = await GovernmentProposal.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals: proposals.map(proposal => ({
        id: proposal._id,
        title: proposal.title,
        description: proposal.description,
        department: proposal.department,
        fundingRequested: proposal.fundingRequested,
        status: proposal.status,
        priority: proposal.priority,
        ngoName: proposal.ngoName,
        location: proposal.location,
        submittedAt: proposal.submittedAt,
        updatedAt: proposal.updatedAt,
        assignedOfficer: proposal.assignedOfficer
      }))
    });
    
  } catch (error) {
    console.error('Error fetching government proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { proposalId, status, reviewComments, assignedOfficer, approvalAmount } = body;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.approvedAt = new Date();
      }
    }

    if (reviewComments) {
      updateData.reviewComments = reviewComments;
      updateData.reviewedAt = new Date();
    }

    if (assignedOfficer) {
      updateData.assignedOfficer = assignedOfficer;
    }

    if (approvalAmount) {
      updateData.approvalAmount = approvalAmount;
    }

    const updatedProposal = await GovernmentProposal.findByIdAndUpdate(
      proposalId,
      updateData,
      { new: true }
    );

    if (!updatedProposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal updated successfully',
      proposal: {
        id: updatedProposal._id,
        title: updatedProposal.title,
        status: updatedProposal.status,
        updatedAt: updatedProposal.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating government proposal:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}
