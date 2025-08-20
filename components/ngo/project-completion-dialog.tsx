import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Award, CheckCircle, HelpCircle, TrendingUp, User, XCircle } from "lucide-react";

// Project Completion Component with XP Rewards
type Contributor = {
  id: string;
  name: string;
  role: string;
  totalHoursContributed: number;
};

type ProjectLike = {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled' | string;
  progress: number;
  contributors?: Contributor[];
};

type Reward = {
  contributorId: string;
  contributorName: string;
  totalHours: number;
  attendanceRate: number;
  xpRewarded: number;
  breakdown: {
    baseXP: number;
    hoursXP: number;
    attendanceXP: number;
    performanceXP: number;
  };
};

interface ProjectCompletionDialogProps {
  open: boolean;
  onClose: () => void;
  project: ProjectLike;
  onComplete: (data: { projectId: string; completionDate: Date; contributorRewards: Reward[]; totalXPAwarded: number }) => void;
}

export function ProjectCompletionDialog({
  open,
  onClose,
  project,
  onComplete
}: ProjectCompletionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('confirmation');
  const [rewards, setRewards] = useState<Reward[] | null>(null);
  const { toast } = useToast();

  // Calculate estimated XP rewards for preview
  const calculateEstimatedRewards = (): Reward[] => {
    // This would normally be done by the AI backend
    const list = project.contributors ?? [];
    return list.map((contributor: Contributor) => {
      // Base XP + hours factor + attendance factor + performance factor
      const baseXP = 500;
      const hoursXP = Math.min(contributor.totalHoursContributed * 10, 1000);
      const attendanceXP = Math.round((contributor.totalHoursContributed / 500) * 500);
      const performanceXP = Math.round((Math.random() * 0.4 + 0.6) * 500); // Random between 60-100%
      
      const totalXP = baseXP + hoursXP + attendanceXP + performanceXP;
      
      return {
        contributorId: contributor.id,
        contributorName: contributor.name,
        totalHours: contributor.totalHoursContributed,
        attendanceRate: Math.floor(80 + Math.random() * 20), // Random between 80-100%
        xpRewarded: totalXP,
        breakdown: {
          baseXP,
          hoursXP,
          attendanceXP,
          performanceXP
        }
      };
    });
  };

  const handleCompleteProject = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call the API endpoint
      // Here we simulate with a timeout
      setTimeout(() => {
        const calculatedRewards = calculateEstimatedRewards();
        setRewards(calculatedRewards);
        setStep('rewards');
        setIsSubmitting(false);
        
        // Update project status in parent component
        onComplete({
          projectId: project.id,
          completionDate: new Date(),
          contributorRewards: calculatedRewards,
          totalXPAwarded: calculatedRewards.reduce((sum: number, r: Reward) => sum + r.xpRewarded, 0)
        });
      }, 2500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete project",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Complete Project</DialogTitle>
          <DialogDescription>
            {step === 'confirmation' ? 
              'Mark this project as complete and distribute XP rewards to contributors' :
              'Project completed successfully! XP rewards have been distributed'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'confirmation' && (
          <>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-800">
                      Are you sure you want to complete this project?
                    </p>
                    <p className="text-sm text-amber-700">
                      This action will mark the project as complete, calculate final environmental impact, 
                      and distribute XP rewards to all contributors based on their participation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="font-medium">{project.name}</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{project.contributors?.length || 0} Contributors</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{project.progress}% Complete</span>
                  </div>
                </div>
                
                <p className="text-sm">
                  <span className="font-medium">Current status:</span>{' '}
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </p>
                
                <p className="text-sm">
                  <span className="font-medium">Expected rewards:</span>{' '}
                  <span className="text-amber-600">
                    ~{(project.contributors?.length || 0) * 1500}-{(project.contributors?.length || 0) * 2500} XP total
                  </span>
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteProject}
                disabled={isSubmitting || project.progress < 90}
                className={project.progress >= 90 ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === 'rewards' && rewards && (
          <>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800">
                      Project completed successfully!
                    </p>
                    <p className="text-sm text-green-700">
                      All contributors have been rewarded with XP points based on their contributions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">XP Rewards Distribution</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributor</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP Awarded</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rewards.map((reward, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="font-medium">{reward.contributorName}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {reward.totalHours}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <Badge variant="outline" className={
                              reward.attendanceRate >= 90 ? "bg-green-50 text-green-700 border-green-200" :
                              reward.attendanceRate >= 75 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              "bg-red-50 text-red-700 border-red-200"
                            }>
                              {reward.attendanceRate}%
                            </Badge>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="font-medium">{reward.xpRewarded.toLocaleString()} XP</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Total XP Awarded</span>
                  </div>
                  <div className="text-xl font-bold text-purple-700">
                    {rewards.reduce((sum, r) => sum + r.xpRewarded, 0).toLocaleString()} XP
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
