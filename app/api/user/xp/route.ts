import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId, amount, eventType, description, environmentalImpact, relatedItemId, location, participants, duration } = await req.json();
    
    if (!userId || !amount || !eventType || !description) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    
    const activityData = {
      eventType,
      description,
      environmentalImpact,
      timestamp: new Date(),
      relatedItemId,
      location,
      participants,
      duration
    };
    
    await user.addXP(amount, activityData as any);
    // Save the user to persist changes
    await user.save();
    
    // Refresh user data after update to ensure we have the latest
    const updatedUser = await User.findById(userId);
    
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Failed to retrieve updated user data" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser._id,
        xpPoints: updatedUser.xpPoints,
        level: updatedUser.level,
        environmentalImpact: updatedUser.environmentalImpact,
        activityHistory: updatedUser.activityHistory.slice(0, 10) // Return only the 10 most recent activities
      }
    });
    
  } catch (error) {
    console.error("Error updating XP:", error);
    return NextResponse.json({ success: false, message: "Error updating XP" }, { status: 500 });
  }
}
