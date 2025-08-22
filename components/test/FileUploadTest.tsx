"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';

// Simple test component to verify file upload functionality
export function FileUploadTest() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, GIF) or PDF");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }

      // Create filename
      const timestamp = Date.now();
      const fileName = `receipt-${timestamp}-${file.name}`;
      setSelectedFile(fileName);
      setSelectedFileName(file.name);
      setError("");
      console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile("");
    setSelectedFileName("");
    setError("");
    const fileInput = document.getElementById('test-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">File Upload Test</h2>
      
      <div className="mb-4">
        <label htmlFor="test-file-input" className="block text-sm font-medium mb-2">
          Upload Payment Receipt
        </label>
        
        <label 
          htmlFor="test-file-input" 
          className={`flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : selectedFile 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className={`w-8 h-8 mb-2 mx-auto ${
              selectedFile ? 'text-green-600' : 'text-gray-400'
            }`} />
            <p className="text-sm text-gray-600">
              {isDragOver 
                ? 'Drop your file here' 
                : 'Click to upload or drag and drop'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: JPG, PNG, GIF, PDF (max 5MB)
            </p>
          </div>
          
          <input 
            type="file" 
            className="hidden" 
            id="test-file-input" 
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
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">File Selected</p>
              <p className="text-xs text-green-600 truncate">{selectedFileName}</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-green-600 hover:text-green-800 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 mb-4">⚠ {error}</p>
      )}

      {selectedFile && (
        <button 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {
            console.log("Would submit file:", selectedFile);
            alert(`File ready to submit: ${selectedFileName}`);
          }}
        >
          Test Submit
        </button>
      )}
    </div>
  );
}
