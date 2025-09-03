import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectManagement from '@/models/ProjectManagement';
import { Types } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, report } = body;
    
    if (!projectName || !report) {
      return NextResponse.json({ error: 'Project name and report data are required' }, { status: 400 });
    }

    await dbConnect();
    
    // Try to update the project with new daily report
    let updatedProject = await ProjectManagement.findOneAndUpdate(
      { projectName: projectName },
      { 
        $push: { dailyReports: report },
        $inc: { 'cumulativeStats.completedDays': 1 }
      },
      { new: true }
    );
    
    // If project doesn't exist, create a basic one
    if (!updatedProject) {
      updatedProject = await ProjectManagement.create({
        projectName: projectName,
        dailyReports: [report],
        cumulativeStats: {
          completedDays: 1,
          fundingUtilized: 0,
          totalDays: 1,
          averageDailyProgress: 100
        }
      });
    }
    
    // Calculate total days from start date to now (if startDate exists)
    let totalDays = 1;
    let averageDailyProgress = 100;
    
    if (updatedProject.startDate) {
      const startDate = new Date(updatedProject.startDate);
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDays = Math.max(1, daysDiff);
      const completedDays = updatedProject.cumulativeStats?.completedDays || 1;
      averageDailyProgress = (completedDays / totalDays) * 100;
    }
    
    // Update funding utilized
    const totalFundingUtilized = report.fundingUtilization?.reduce(
      (total: number, item: any) => total + (item.amountSpent || 0), 
      updatedProject.cumulativeStats?.fundingUtilized || 0
    ) || 0;
    
    await ProjectManagement.updateOne(
      { projectName: projectName },
      { 
        $set: { 
          'cumulativeStats.totalDays': totalDays,
          'cumulativeStats.averageDailyProgress': averageDailyProgress,
          'cumulativeStats.fundingUtilized': totalFundingUtilized
        }
      }
    );
    
    return NextResponse.json(updatedProject.dailyReports[updatedProject.dailyReports.length - 1]);
  } catch (error) {
    console.error('Error submitting daily report:', error);
    return NextResponse.json({ error: 'Failed to submit daily report' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectName = url.searchParams.get('projectName');
    const date = url.searchParams.get('date'); // Optional date filter
    const reportId = url.searchParams.get('reportId'); // Optional specific report ID
    
    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    await dbConnect();
    
    const project = await ProjectManagement.findOne({ projectName: projectName });
    
    if (!project) {
      return NextResponse.json([]); // Return empty array if project not found
    }
    
    // If a specific report ID is requested
    if (reportId) {
      const report = project.dailyReports.id(reportId);
      
      if (!report) {
        return NextResponse.json({ error: 'Daily report not found' }, { status: 404 });
      }
      
      return NextResponse.json(report);
    }
    
    let dailyReports = project.dailyReports;
    
    // Filter by date if provided
    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      
      dailyReports = dailyReports.filter((report: any) => {
        const reportDate = new Date(report.date);
        return reportDate >= startOfDay && reportDate <= endOfDay;
      });
    }
    
    return NextResponse.json(dailyReports);
  } catch (error) {
    console.error('Error fetching daily reports:', error);
    return NextResponse.json({ error: 'Failed to fetch daily reports' }, { status: 500 });
  }
}
