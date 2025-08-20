import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectManagement from '@/models/ProjectManagement';
import { AttendanceRecord, DailyContribution } from '@/models/AttendanceAndContribution';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { IUser } from '@/models/User';

const User = mongoose.models.User;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, completionReport } = body;
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Find the project management data
    const project = await ProjectManagement.findOne({ projectId: new Types.ObjectId(projectId) });
    
    if (!project) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }
    
    // Verify the project is ready for completion (e.g., progress is above 95%)
    if (project.status !== 'active' || project.cumulativeStats.averageDailyProgress < 95) {
      return NextResponse.json({ 
        error: 'Project is not eligible for completion. Progress must be at least 95%.' 
      }, { status: 400 });
    }
    
    // Perform AI analysis to calculate XP rewards for each contributor
    const contributors = project.contributors;
    const contributorRewards = [];
    
    // Fetch all attendance and contribution records for this project
    const attendanceRecords = await AttendanceRecord.find({ projectId: new Types.ObjectId(projectId) });
    const contributionRecords = await DailyContribution.find({ projectId: new Types.ObjectId(projectId) });
    
    // Calculate rewards for each contributor based on their contribution
    for (const contributor of contributors) {
      // Calculate contribution metrics
      const userAttendance = attendanceRecords.filter(record => record.contributorId === contributor.id);
      const userContributions = contributionRecords.filter(record => record.contributorId === contributor.id);
      
      // Calculate total hours, attendance rate, and average performance
      const totalDays = userAttendance.length;
      const presentDays = userAttendance.filter(a => a.status === 'present').length;
      const partialDays = userAttendance.filter(a => a.status === 'partial').length;
      
      const attendanceRate = totalDays > 0 ? ((presentDays + (partialDays * 0.5)) / totalDays) : 0;
      const totalHours = userContributions.reduce((sum, c) => sum + c.hoursWorked, 0);
      const avgPerformance = userContributions.length > 0 ? 
        userContributions.reduce((sum, c) => sum + c.performanceRating, 0) / userContributions.length : 
        3; // Default rating
      
      // Calculate XP reward using a formula that considers all factors
      // Base XP + (hours factor) + (attendance factor) + (performance factor)
      const baseXP = 500; // Base XP for project completion
      const hoursXP = Math.min(totalHours * 10, 1000); // Cap at 1000 XP
      const attendanceXP = Math.round(attendanceRate * 500);
      const performanceXP = Math.round((avgPerformance / 5) * 500);
      
      const totalXP = baseXP + hoursXP + attendanceXP + performanceXP;
      
      // Update the user's XP in the database
      if (contributor.id) {
        try {
          const user = await User.findById(contributor.id);
          
          if (user) {
            // Add XP and record the project completion activity
            await user.addXP(totalXP, {
              eventType: 'project_joined',
              description: `Completed project: ${project.projectName}`,
              xpEarned: totalXP,
              environmentalImpact: {
                // Add project specific impact metrics if available
              },
              timestamp: new Date(),
              relatedItemId: projectId.toString()
            });
            
            // Update contributor info in the project management records
            contributor.xpPoints += totalXP;
            contributor.totalHoursContributed = totalHours;
          }
        } catch (userError) {
          console.error(`Error updating XP for user ${contributor.id}:`, userError);
        }
      }
      
      // Store the reward details for the response
      contributorRewards.push({
        contributorId: contributor.id,
        contributorName: contributor.name,
        attendanceRate: Math.round(attendanceRate * 100),
        totalHours,
        avgPerformance: avgPerformance.toFixed(1),
        xpRewarded: totalXP,
        breakdown: {
          baseXP,
          hoursXP,
          attendanceXP,
          performanceXP
        }
      });
    }
    
    // Update project status to completed
    project.status = 'completed';
    project.actualEndDate = new Date();
    project.cumulativeStats.totalXPAwarded = contributorRewards.reduce(
      (sum, reward) => sum + reward.xpRewarded, 0
    );
    
    // Save all updates
    await project.save();
    
    return NextResponse.json({
      success: true,
      projectId,
      projectName: project.projectName,
      completionDate: project.actualEndDate,
      contributorRewards,
      totalXPAwarded: project.cumulativeStats.totalXPAwarded
    });
    
  } catch (error) {
    console.error('Error completing project:', error);
    return NextResponse.json({ error: 'Failed to complete project and award XP' }, { status: 500 });
  }
}
