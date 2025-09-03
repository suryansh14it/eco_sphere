import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, CheckCircle, DollarSign, MapPin } from 'lucide-react';

export interface DailyReportProps {
  projectName: string;
  report: any;
}

const DailyReport: React.FC<DailyReportProps> = ({ projectName, report }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{projectName}</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(report.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{report.reportedBy}</span>
              </div>
              {report.governmentReportSubmitted && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Government Submitted
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Submitted: {formatTime(report.submissionTime)}</div>
            {report.governmentReportId && (
              <div className="text-xs">ID: {report.governmentReportId}</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium">Progress Summary</h4>
          </div>
          <p className="text-sm text-muted-foreground">{report.progressSummary}</p>
        </div>

        {/* Tasks Completed */}
        {report.tasksCompleted && report.tasksCompleted.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h4 className="font-medium">Tasks Completed</h4>
            </div>
            <ul className="space-y-1">
              {report.tasksCompleted.map((task: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Materials Used */}
        {report.materialsUsed && report.materialsUsed.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Materials Used</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {report.materialsUsed.map((material: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{material.name}</span>
                  <span>{material.quantity} {material.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funding Utilization */}
        {report.fundingUtilization && report.fundingUtilization.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <h4 className="font-medium">Funding Utilization</h4>
            </div>
            <div className="space-y-2">
              {report.fundingUtilization.map((funding: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{funding.description}</span>
                  <span className="font-medium">₹{funding.amountSpent?.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{report.fundingUtilization.reduce((sum: number, item: any) => sum + (item.amountSpent || 0), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Weather Conditions */}
        {report.weatherConditions && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium">Weather Conditions</h4>
            </div>
            <p className="text-sm text-muted-foreground">{report.weatherConditions}</p>
          </div>
        )}

        {/* Challenges and Next Day Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.challengesFaced && (
            <div>
              <h4 className="font-medium mb-2">Challenges Faced</h4>
              <p className="text-sm text-muted-foreground">{report.challengesFaced}</p>
            </div>
          )}
          {report.nextDayPlan && (
            <div>
              <h4 className="font-medium mb-2">Next Day Plan</h4>
              <p className="text-sm text-muted-foreground">{report.nextDayPlan}</p>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        {report.contributorAttendance && (
          <div className="bg-muted/20 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Attendance Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{report.contributorAttendance.totalPresent}</div>
                <div className="text-muted-foreground">Present</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-yellow-600">{report.contributorAttendance.totalPartial}</div>
                <div className="text-muted-foreground">Partial</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{report.contributorAttendance.totalAbsent}</div>
                <div className="text-muted-foreground">Absent</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReport;
