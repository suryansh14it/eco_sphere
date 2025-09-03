import React, { useEffect, useState } from 'react';
import DailyReport from '@/components/government/daily-report';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, FileText } from 'lucide-react';

interface DailyReportData {
  projectName: string;
  date?: string;
  reportedBy?: string;
  summary?: string;
  [key: string]: any;
}

const DailyReportsOverview: React.FC = () => {
  const [reports, setReports] = useState<DailyReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/daily-reports');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.dailyReports);
      } else {
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>NGO Daily Reports Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading daily reports...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>NGO Daily Reports Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchReports} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>NGO Daily Reports Overview</CardTitle>
          <Button onClick={fetchReports} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No daily reports found</p>
            <p className="text-sm text-muted-foreground">Daily reports will appear here once NGOs submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, idx) => (
              <DailyReport key={report._id || idx} projectName={report.projectName} report={report} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReportsOverview;
