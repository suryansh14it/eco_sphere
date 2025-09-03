import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { DailyReport } from '@/models/DailyReport';

// GET: Fetch all daily reports with project name
export async function GET() {
  await dbConnect();
  try {
    const dailyReports = await DailyReport.find({})
      .sort({ submissionTime: -1 }) // Sort by newest first
      .lean();
    
    return NextResponse.json({ success: true, dailyReports });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

// POST: Save a daily report for a project
export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { projectName, report } = body;
  if (!projectName || !report) {
    return NextResponse.json({ error: 'Project name and report data are required' }, { status: 400 });
  }
  try {
    const dailyReport = new DailyReport({
      ...report,
      projectName: projectName,
      submissionTime: new Date(),
      status: 'submitted'
    });
    
    await dailyReport.save();
    
    return NextResponse.json({ success: true, dailyReport });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
