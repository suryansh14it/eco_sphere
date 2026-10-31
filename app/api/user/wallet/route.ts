import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';

/**
 * GET /api/user/wallet
 * Get the current user's wallet address
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      walletAddress: user.walletAddress || null
    });

  } catch (error: any) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/user/wallet
 * Set or update the current user's wallet address
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const { walletAddress } = await req.json();

    // Validate wallet address format if provided
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({
        success: false,
        message: "Invalid Ethereum wallet address format. Must be 42 characters starting with 0x."
      }, { status: 400 });
    }

    // Update wallet address (can be null to remove it)
    user.walletAddress = walletAddress || undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: walletAddress ? "Wallet address updated successfully" : "Wallet address removed successfully",
      walletAddress: user.walletAddress || null
    });

  } catch (error: any) {
    console.error('Error updating wallet address:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/user/wallet
 * Remove the current user's wallet address
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Remove wallet address
    user.walletAddress = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Wallet address removed successfully"
    });

  } catch (error: any) {
    console.error('Error removing wallet address:', error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
