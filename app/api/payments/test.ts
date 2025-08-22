// Test file for payment API - can be used for manual testing
// This file demonstrates how to use the payment API

export const testPaymentAPI = async () => {
  // Example test data
  const testPaymentData = {
    proposalId: "test-proposal-id",
    upiId: "ecosphere@upi",
    qrCode: "/test-qr.png",
    totalAmount: "₹1.4Cr",
    projectAmount: "₹1.27Cr",
    ngoCommission: "₹8L",
    researcherCommission: "₹5L",
    ngoCommissionPercent: 5.7,
    researcherCommissionPercent: 3.6,
    receiptUrl: "receipt-test-123456.jpg",
    transactionId: "TXN-TEST-123456"
  };

  try {
    // Test POST request
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentData),
    });

    const result = await response.json();
    console.log('Payment API Test Result:', result);
    
    return result;
  } catch (error) {
    console.error('Payment API Test Error:', error);
    throw error;
  }
};

// Example usage in browser console:
// testPaymentAPI().then(result => console.log('Success:', result)).catch(err => console.error('Error:', err));
