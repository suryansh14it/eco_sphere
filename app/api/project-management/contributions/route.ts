import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectManagement from '@/models/ProjectManagement';
import { Types } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, contribution } = body;
    
    if (!projectId || !contribution) {
      return NextResponse.json({ error: 'Project ID and contribution data are required' }, { status: 400 });
    }

    await dbConnect();
    
    // Update the project with new contribution record
    const updatedProject = await ProjectManagement.findOneAndUpdate(
      { projectId: new Types.ObjectId(projectId) },
      { $push: { contributionRecords: contribution } },
      { new: true }
    );
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }
    
  // Update contributor's total hours
  const contributor = updatedProject.contributors.find((c: any) => c.id === contribution.contributorId);
    
    if (contributor) {
      contributor.totalHoursContributed += contribution.hoursWorked;
      await updatedProject.save();
    }
    
    return NextResponse.json(updatedProject.contributionRecords[updatedProject.contributionRecords.length - 1]);
  } catch (error) {
    console.error('Error recording contribution:', error);
    return NextResponse.json({ error: 'Failed to record contribution' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const contributorId = url.searchParams.get('contributorId'); // Optional contributor filter
    const date = url.searchParams.get('date'); // Optional date filter
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    const project = await ProjectManagement.findOne({ projectId: new Types.ObjectId(projectId) });
    
    if (!project) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }
    
    let contributionRecords = project.contributionRecords;
    
    // Filter by contributor if provided
    if (contributorId) {
      contributionRecords = contributionRecords.filter((record: any) => record.contributorId === contributorId);
    }
    
    // Filter by date if provided
    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      
      contributionRecords = contributionRecords.filter((record: any) => {
        const recordDate = new Date(record.date);
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });
    }
    
    return NextResponse.json(contributionRecords);
  } catch (error) {
    console.error('Error fetching contribution records:', error);
    return NextResponse.json({ error: 'Failed to fetch contribution records' }, { status: 500 });
  }
}
