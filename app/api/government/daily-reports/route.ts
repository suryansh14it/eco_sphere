import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectManagement from '@/models/ProjectManagement';

export async function GET() {
  await dbConnect();
  try {
    // Fetch all projects with their daily reports and project name
    const projects = await ProjectManagement.find({}, 'projectName dailyReports').lean();
    // Flatten daily reports with project name
    const dailyReports = projects.flatMap(project =>
      (project.dailyReports || []).map(report => ({
        projectName: project.projectName,
        ...report
      }))
    );
    return NextResponse.json({ success: true, dailyReports });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
