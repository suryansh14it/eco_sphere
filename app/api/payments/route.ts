import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GovernmentProposal from '@/models/GovernmentProposal';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { 
      proposalId,
      upiId,
      qrCode,
      totalAmount,
      projectAmount,
      ngoCommission,
      researcherCommission,
      ngoCommissionPercent,
      researcherCommissionPercent,
      receiptUrl,
      transactionId
    } = body;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a mock/static ID (for demo purposes)
    const isMockId = !mongoose.Types.ObjectId.isValid(proposalId);

    if (isMockId) {
      // Handle mock/static IDs - just return success for demo
      console.log('🎭 Processing payment for mock proposal ID:', proposalId);

      return NextResponse.json(
        {
          success: true,
          message: 'Payment details saved successfully (demo mode)',
          payment: {
            upiId: upiId || 'ecosphere@upi',
            qrCode: qrCode || '',
            totalAmount: totalAmount || '',
            projectAmount: projectAmount || '',
            ngoCommission: ngoCommission || '',
            researcherCommission: researcherCommission || '',
            ngoCommissionPercent: ngoCommissionPercent || 0,
            researcherCommissionPercent: researcherCommissionPercent || 0,
            paymentStatus: receiptUrl ? 'completed' : 'pending',
            receiptUrl: receiptUrl || '',
            transactionId: transactionId || `TXN-DEMO-${Date.now()}`,
            paymentDate: receiptUrl ? new Date() : undefined,
            verificationStatus: 'verified'
          },
          proposalStatus: 'approved',
          note: 'This is a demo payment for static data'
        },
        { status: 200 }
      );
    }

    // Find the real proposal in database
    const proposal = await GovernmentProposal.findById(proposalId);
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Update payment details
    const paymentData = {
      upiId: upiId || 'ecosphere@upi',
      qrCode: qrCode || '',
      totalAmount: totalAmount || '',
      projectAmount: projectAmount || '',
      ngoCommission: ngoCommission || '',
      researcherCommission: researcherCommission || '',
      ngoCommissionPercent: ngoCommissionPercent || 0,
      researcherCommissionPercent: researcherCommissionPercent || 0,
      paymentStatus: receiptUrl ? 'completed' : 'pending',
      receiptUrl: receiptUrl || '',
      transactionId: transactionId || '',
      paymentDate: receiptUrl ? new Date() : undefined,
      verificationStatus: 'verified' // Remove verification requirement as requested
    };

    // Update the proposal with payment details
    const updatedProposal = await GovernmentProposal.findByIdAndUpdate(
      proposalId,
      { 
        $set: { 
          paymentDetails: paymentData,
          status: receiptUrl ? 'approved' : proposal.status,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Payment details saved successfully',
        payment: updatedProposal.paymentDetails,
        proposalStatus: updatedProposal.status
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query: any = {};
    
    if (proposalId) {
      // Check if this is a mock/static ID
      const isMockId = !mongoose.Types.ObjectId.isValid(proposalId);

      if (isMockId) {
        // Return mock payment data for demo
        return NextResponse.json(
          {
            success: true,
            payment: {
              upiId: 'ecosphere@upi',
              paymentStatus: 'pending',
              verificationStatus: 'verified'
            },
            proposalId: proposalId,
            title: 'Demo Proposal',
            note: 'This is demo data for static proposal'
          },
          { status: 200 }
        );
      }

      const proposal = await GovernmentProposal.findById(proposalId);
      if (!proposal) {
        return NextResponse.json(
          { error: 'Proposal not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          payment: proposal.paymentDetails,
          proposalId: proposal._id,
          title: proposal.title
        },
        { status: 200 }
      );
    }
    
    if (status) {
      query['paymentDetails.paymentStatus'] = status;
    }
    
    const proposals = await GovernmentProposal.find(query)
      .select('title department paymentDetails status submittedAt')
      .sort({ 'paymentDetails.paymentDate': -1 })
      .limit(limit);
    
    const payments = proposals.map(proposal => ({
      proposalId: proposal._id,
      title: proposal.title,
      department: proposal.department,
      status: proposal.status,
      paymentDetails: proposal.paymentDetails,
      submittedAt: proposal.submittedAt
    }));

    return NextResponse.json(
      { 
        success: true, 
        payments,
        count: payments.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch payments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { proposalId, paymentStatus, verificationStatus, verificationNotes, receiptUrl, transactionId } = body;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a mock/static ID
    const isMockId = !mongoose.Types.ObjectId.isValid(proposalId);

    if (isMockId) {
      // Handle mock/static IDs - just return success for demo
      console.log('🎭 Updating payment for mock proposal ID:', proposalId);

      return NextResponse.json(
        {
          success: true,
          message: 'Payment updated successfully (demo mode)',
          payment: {
            paymentStatus: paymentStatus || 'pending',
            verificationStatus: verificationStatus || 'verified',
            verificationNotes: verificationNotes || '',
            receiptUrl: receiptUrl || '',
            transactionId: transactionId || `TXN-DEMO-${Date.now()}`,
            updatedAt: new Date()
          },
          note: 'This is a demo update for static data'
        },
        { status: 200 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (paymentStatus) {
      updateData['paymentDetails.paymentStatus'] = paymentStatus;
      if (paymentStatus === 'completed') {
        updateData['paymentDetails.paymentDate'] = new Date();
      }
    }

    if (verificationStatus) {
      updateData['paymentDetails.verificationStatus'] = verificationStatus;
    }

    if (verificationNotes) {
      updateData['paymentDetails.verificationNotes'] = verificationNotes;
    }

    if (receiptUrl) {
      updateData['paymentDetails.receiptUrl'] = receiptUrl;
    }

    if (transactionId) {
      updateData['paymentDetails.transactionId'] = transactionId;
    }

    const updatedProposal = await GovernmentProposal.findByIdAndUpdate(
      proposalId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Payment updated successfully',
        payment: updatedProposal.paymentDetails
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
