import { FileUploadTest } from '@/components/test/FileUploadTest';

export default function TestUploadPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">File Upload Test Page</h1>
        <FileUploadTest />
      </div>
    </div>
  );
}
