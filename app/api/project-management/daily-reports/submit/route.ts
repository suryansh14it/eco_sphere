import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { DailyReport } from '@/models/DailyReport';
import { AttendanceRecord } from '@/models/AttendanceAndContribution';
import ProjectManagement from '@/models/ProjectManagement';
import { Types } from 'mongoose';

// Helper function for generating Government report IDs (India specific)
function generateIndianGovtReportId(projectName: string, date: Date): string {
  const ministryPrefix = "MOEFCC";
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${ministryPrefix}-${dateStr}-${randomPart}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, report } = body;
    
    if (!projectId || !report) {
      return NextResponse.json({ error: 'Project ID and report data are required' }, { status: 400 });
    }

    await dbConnect();
    
    // Get project details
    const project = await ProjectManagement.findOne({ projectId: new Types.ObjectId(projectId) });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Get today's attendance for this project
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceRecords = await AttendanceRecord.find({
      projectId: new Types.ObjectId(projectId),
      date: { $gte: today }
    });
    
    // Prepare attendance summary for the report
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const partialCount = attendanceRecords.filter(r => r.status === 'partial').length;
    const absentCount = project.contributors.length - presentCount - partialCount;
    
    // Generate a government report ID if submitted to government
    let governmentReportId = null;
    if (report.governmentReportSubmitted) {
      governmentReportId = generateIndianGovtReportId(project.projectName, new Date());
    }
    
    // Create the daily report with enhanced data
    const dailyReport = new DailyReport({
      ...report,
      projectId: new Types.ObjectId(projectId),
      projectName: project.projectName,
      contributorAttendance: {
        totalPresent: presentCount,
        totalAbsent: absentCount,
        totalPartial: partialCount
      },
      governmentReportId,
      submissionTime: new Date(),
      status: 'submitted'
    });
    
    await dailyReport.save();
    
    // Update project statistics
    const totalFundingUtilized = report.fundingUtilization.reduce(
      (total: number, item: { amountSpent: number }) => total + item.amountSpent, 
      project.cumulativeStats.fundingUtilized || 0
    );
    
    // Calculate impact metrics based on the report
    const updatedImpactMetrics = { ...project.impactMetrics };
    if (report.environmentalImpactMetrics.wasteCollected) {
      const currentWaste = parseFloat(updatedImpactMetrics.wasteRemoved || '0');
      const newWaste = parseFloat(report.environmentalImpactMetrics.wasteCollected || '0');
      updatedImpactMetrics.wasteRemoved = `${currentWaste + newWaste} tons`;
    }
    
    // Update project
    await ProjectManagement.updateOne(
      { projectId: new Types.ObjectId(projectId) },
      { 
        $set: { 
          'cumulativeStats.fundingUtilized': totalFundingUtilized,
          'cumulativeStats.completedDays': (project.cumulativeStats.completedDays || 0) + 1,
          impactMetrics: updatedImpactMetrics
        },
        $push: { 
          dailyReports: dailyReport._id 
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      dailyReport,
      governmentReportId
    });
  } catch (error) {
    console.error('Error submitting daily report:', error);
    return NextResponse.json({ error: 'Failed to submit daily report' }, { status: 500 });
  }
}
