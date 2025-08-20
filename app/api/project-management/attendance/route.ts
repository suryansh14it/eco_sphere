import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectManagement from '@/models/ProjectManagement';
import { AttendanceRecord } from '@/models/AttendanceAndContribution';
import { Types } from 'mongoose';

// Helper function to translate coordinates to Indian addresses (mock implementation)
async function getIndianAddress(lat: number, lng: number): Promise<string> {
  // In a real application, you would use a geocoding service
  // This is a mock implementation based on latitude/longitude ranges
  
  if (lat >= 28.5 && lat <= 28.7 && lng >= 77.1 && lng <= 77.3) {
    return 'Delhi NCR Region, New Delhi, India';
  } else if (lat >= 19.0 && lat <= 19.2 && lng >= 72.8 && lng <= 73.0) {
    return 'Mumbai, Maharashtra, India';
  } else if (lat >= 12.9 && lat <= 13.1 && lng >= 77.5 && lng <= 77.7) {
    return 'Bengaluru, Karnataka, India';
  } else if (lat >= 17.3 && lat <= 17.5 && lng >= 78.3 && lng <= 78.5) {
    return 'Hyderabad, Telangana, India';
  } else if (lat >= 22.5 && lat <= 22.7 && lng >= 88.3 && lng <= 88.5) {
    return 'Kolkata, West Bengal, India';
  }
  
  // Default fallback
  return 'Unnamed location, India';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, attendance } = body;
    
    if (!projectId || !attendance) {
      return NextResponse.json({ error: 'Project ID and attendance data are required' }, { status: 400 });
    }

    await dbConnect();
    
    // Get address information from coordinates
    const address = await getIndianAddress(
      attendance.gpsLocationEntry.latitude,
      attendance.gpsLocationEntry.longitude
    );
    
    // Create a new attendance record with Indian-specific data
    const attendanceWithAddress = {
      ...attendance,
      projectId: new Types.ObjectId(projectId),
      gpsLocationEntry: {
        ...attendance.gpsLocationEntry,
        address
      },
      // Record whether this is during monsoon season (affects work conditions)
      weatherConditions: new Date().getMonth() >= 5 && new Date().getMonth() <= 8 ? 
        'Monsoon season - limited outdoor work possible' : 'Regular weather conditions'
    };
    
    // Save the new attendance record
    const newAttendanceRecord = new AttendanceRecord(attendanceWithAddress);
    await newAttendanceRecord.save();
    
    // Also update the project management data
    const updatedProject = await ProjectManagement.findOneAndUpdate(
      { projectId: new Types.ObjectId(projectId) },
      { $push: { attendanceRecords: newAttendanceRecord._id } },
      { new: true }
    );
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }
    
    // Get today's date at midnight for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count today's attendance records
    const todayAttendance = await AttendanceRecord.find({
      projectId: new Types.ObjectId(projectId),
      date: { $gte: today }
    });
    
    // Calculate attendance metrics
    const totalAttendanceToday = todayAttendance.length;
    const presentAttendanceToday = todayAttendance.filter(
      record => record.status === 'present' || record.status === 'partial'
    ).length;
    
    const attendanceRateToday = totalAttendanceToday > 0 ? 
      (presentAttendanceToday / totalAttendanceToday) * 100 : 0;
    
    // Update project stats
    await ProjectManagement.updateOne(
      { projectId: new Types.ObjectId(projectId) },
      { 
        $set: { 
          'cumulativeStats.attendanceRate': attendanceRateToday,
          'cumulativeStats.todayAttendance': {
            total: totalAttendanceToday,
            present: presentAttendanceToday,
            date: new Date()
          }
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      attendanceRecord: newAttendanceRecord,
      location: address
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, attendanceId, exitData } = body;
    
    if (!projectId || !attendanceId || !exitData) {
      return NextResponse.json({ error: 'Project ID, attendance ID and exit data are required' }, { status: 400 });
    }

    await dbConnect();
    
    const project = await ProjectManagement.findOne({ projectId: new Types.ObjectId(projectId) });
    
    if (!project) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }
    
    // Find and update the specific attendance record
    const attendanceRecord = project.attendanceRecords.id(attendanceId);
    
    if (!attendanceRecord) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }
    
    // Update the exit data
    attendanceRecord.exitTime = exitData.exitTime;
    attendanceRecord.gpsLocationExit = exitData.gpsLocationExit;
    attendanceRecord.exitPhotoUrl = exitData.exitPhotoUrl;
    
    // Calculate duration and update status
    const entryTime = new Date(attendanceRecord.entryTime).getTime();
    const exitTime = new Date(exitData.exitTime).getTime();
    const durationHours = (exitTime - entryTime) / (1000 * 60 * 60);
    
    // Update status based on hours worked
    if (durationHours >= 6) {
      attendanceRecord.status = 'present';
    } else {
      attendanceRecord.status = 'partial';
    }
    
    await project.save();
    
    // Recalculate attendance stats
    const totalAttendance = project.attendanceRecords.length;
    const presentAttendance = project.attendanceRecords.filter(
      (record: any) => record.status === 'present' || record.status === 'partial'
    ).length;
    
    const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;
    
    project.cumulativeStats.attendanceRate = attendanceRate;
    await project.save();
    
    return NextResponse.json(attendanceRecord);
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json({ error: 'Failed to update attendance record' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const date = url.searchParams.get('date'); // Optional date filter
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    const query: any = { projectId: new Types.ObjectId(projectId) };
    
    const project = await ProjectManagement.findOne(query);
    
    if (!project) {
      return NextResponse.json({ error: 'Project management data not found' }, { status: 404 });
    }
    
    let attendanceRecords = project.attendanceRecords;
    
    // Filter by date if provided
    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      
      attendanceRecords = attendanceRecords.filter((record: any) => {
        const recordDate = new Date(record.date);
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });
    }
    
    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 });
  }
}
