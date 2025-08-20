import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProjectProposal from '@/models/ProjectProposal';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const { title, sdgFocus, location, description, researcherId, researcherEmail } = body;
    
    if (!title || !sdgFocus || !location || !description || !researcherId || !researcherEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create project proposal document
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
      status: 'submitted'
    });

    // Save to database
    const result = await projectProposal.save();

    return NextResponse.json(
      { 
        success: true, 
        proposalId: result._id,
        message: 'Project proposal submitted successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting project proposal:', error);
    return NextResponse.json(
      { error: 'Failed to submit project proposal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const researcherId = searchParams.get('researcherId');

    let query = {};
    if (researcherId) {
      query = { researcherId };
    }

    const proposals = await ProjectProposal.find(query)
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({ proposals }, { status: 200 });

  } catch (error) {
    console.error('Error fetching project proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project proposals' },
      { status: 500 }
    );
  }
}
