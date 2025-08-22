import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ResearcherProposal from '@/models/ResearcherProposal';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const newProposal = new ResearcherProposal(data);
    await newProposal.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Researcher proposal submitted successfully',
      proposal: newProposal 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error submitting researcher proposal' 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    
    const ngoId = searchParams.get('ngoId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};
    if (ngoId) query.ngoId = ngoId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const proposals = await ResearcherProposal.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ResearcherProposal.countDocuments(query);

    return NextResponse.json({ 
      success: true, 
      proposals,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error fetching researcher proposals' 
    }, { status: 500 });
  }
}
