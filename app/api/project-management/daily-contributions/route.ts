import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { DailyContribution } from '@/models/AttendanceAndContribution';
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
    
    // Add project ID to the contribution
    const contributionWithProject = {
      ...contribution,
      projectId: new Types.ObjectId(projectId),
    };
    
    // Calculate XP points based on contribution
    // Formula: base + (hours × factor) + (performance bonus) + (skills factor)
    const baseXP = 10;
    const hoursWorked = contribution.hoursWorked || 0;
    const hoursXP = Math.min(hoursWorked * 5, 50); // Cap at 50 XP
    
    const performanceRating = contribution.performanceRating || 3;
    const performanceXP = (performanceRating - 3) * 10; // -20 to +20 XP
    
    const skillsCount = (contribution.skillsApplied || []).length;
    const skillsXP = skillsCount * 5; // 5 XP per skill applied
    
    const totalXP = Math.max(baseXP + hoursXP + performanceXP + skillsXP, 0);
    contributionWithProject.xpPointsEarned = totalXP;
    
    // Save the new contribution record
    const newContribution = new DailyContribution(contributionWithProject);
    await newContribution.save();
    
    // Update project management record
    const project = await ProjectManagement.findOne({ projectId: new Types.ObjectId(projectId) });
    
    if (project) {
      // Find and update the contributor's XP in the project
      const contributor = project.contributors.find((c: any) => c.id === contribution.contributorId);
      
      if (contributor) {
        contributor.xpPoints += totalXP;
        contributor.totalHoursContributed += hoursWorked;
        await project.save();
      }
    }
    
    return NextResponse.json({
      success: true,
      contribution: newContribution,
      xpEarned: totalXP,
      xpBreakdown: {
        baseXP,
        hoursXP,
        performanceXP,
        skillsXP
      }
    });
  } catch (error) {
    console.error('Error recording contribution:', error);
    return NextResponse.json({ error: 'Failed to record daily contribution' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const contributorId = url.searchParams.get('contributorId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Build query
    const query: any = { 
      projectId: new Types.ObjectId(projectId) 
    };
    
    if (contributorId) {
      query.contributorId = contributorId;
    }
    
    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Get contributions
    const contributions = await DailyContribution.find(query).sort({ date: -1 });
    
    // Calculate summary stats
    const totalHours = contributions.reduce((sum, c) => sum + c.hoursWorked, 0);
    const totalXP = contributions.reduce((sum, c) => sum + c.xpPointsEarned, 0);
    const avgPerformance = contributions.length > 0 ? 
      contributions.reduce((sum, c) => sum + c.performanceRating, 0) / contributions.length : 0;
    
    return NextResponse.json({
      contributions,
      summary: {
        totalHours,
        totalXP,
        avgPerformance: avgPerformance.toFixed(1),
        contributionsCount: contributions.length
      }
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch daily contributions' }, { status: 500 });
  }
}
