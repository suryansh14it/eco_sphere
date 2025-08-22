"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function TestPaymentPage() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (file: File) => {
    if (file) {
      const timestamp = Date.now();
      const fileName = `receipt-${timestamp}-${file.name}`;
      setSelectedFile(fileName);
      setSelectedFileName(file.name);
      setError("");
      console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    }
  };

  const testPaymentSubmission = async () => {
    if (!selectedFile) return;
    
    setIsSubmitting(true);
    setError("");
    setResult(null);
    
    try {
      const paymentData = {
        proposalId: "accepted-urban-forest", // Test with mock ID
        upiId: "ecosphere@upi",
        qrCode: "",
        totalAmount: "₹1.4Cr",
        projectAmount: "₹1.27Cr",
        ngoCommission: "₹8L",
        researcherCommission: "₹5L",
        ngoCommissionPercent: 5.7,
        researcherCommissionPercent: 3.6,
        receiptUrl: selectedFile,
        transactionId: `TXN-TEST-${Date.now()}`
      };

      console.log('🧪 Testing payment submission:', paymentData);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Payment failed');
      }

      setResult(responseData);
      console.log('✅ Payment test successful:', responseData);
      
    } catch (error) {
      console.error('❌ Payment test failed:', error);
      setError(error instanceof Error ? error.message : 'Payment test failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Payment Upload Test</h1>
          
          {/* File Upload */}
          <div className="mb-6">
            <label htmlFor="test-file" className="block text-sm font-medium mb-2">
              Upload Payment Receipt
            </label>
            
            <label 
              htmlFor="test-file" 
              className={`flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <Upload className={`w-8 h-8 mb-2 mx-auto ${
                  selectedFile ? 'text-green-600' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-600">
                  Click to upload payment receipt
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports: JPG, PNG, GIF, PDF (max 5MB)
                </p>
              </div>
              
              <input 
                type="file" 
                className="hidden" 
                id="test-file" 
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Selected file display */}
          {selectedFile && selectedFileName && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Upload className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">File Selected</p>
                  <p className="text-xs text-green-600 truncate">{selectedFileName}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Test Button */}
          <Button 
            onClick={testPaymentSubmission}
            disabled={!selectedFile || isSubmitting}
            className="w-full mb-4"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Testing Payment...
              </>
            ) : (
              'Test Payment Submission'
            )}
          </Button>
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">❌ {error}</p>
            </div>
          )}
          
          {/* Result Display */}
          {result && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-2">✅ Payment Test Successful!</p>
              <pre className="text-xs text-green-600 bg-green-100 p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Test Details:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tests file upload functionality</li>
              <li>Uses mock proposal ID: "accepted-urban-forest"</li>
              <li>Simulates payment form submission</li>
              <li>Shows API response and error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
