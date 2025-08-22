import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LocalInitiative from '@/models/LocalInitiative';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const newInitiative = new LocalInitiative(data);
    await newInitiative.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Local initiative proposal submitted successfully',
      initiative: newInitiative 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error submitting local initiative proposal' 
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
    
    const initiatives = await LocalInitiative.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LocalInitiative.countDocuments(query);

    return NextResponse.json({ 
      success: true, 
      initiatives,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error fetching local initiatives' 
    }, { status: 500 });
  }
}
