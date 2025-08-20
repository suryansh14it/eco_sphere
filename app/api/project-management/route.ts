import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectManagement from '@/models/ProjectManagement';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    const projectManagement = await ProjectManagement.findOne({ projectId });
    
    if (!projectManagement) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }

    return NextResponse.json(projectManagement);
  } catch (error) {
    console.error('Error fetching project management data:', error);
    return NextResponse.json({ error: 'Failed to fetch project management data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    await dbConnect();
    
    // Check if project management data already exists
    const existingProject = await ProjectManagement.findOne({ projectId: body.projectId });
    
    if (existingProject) {
      return NextResponse.json({ error: 'Project management data already exists for this project' }, { status: 400 });
    }
    
    const projectManagement = await ProjectManagement.create(body);
    
    return NextResponse.json(projectManagement, { status: 201 });
  } catch (error) {
    console.error('Error creating project management data:', error);
    return NextResponse.json({ error: 'Failed to create project management data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    const updatedProject = await ProjectManagement.findOneAndUpdate(
      { projectId },
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project management data:', error);
    return NextResponse.json({ error: 'Failed to update project management data' }, { status: 500 });
  }
}
