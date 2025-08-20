// Enhanced components for the NGO project management page
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Camera, MapPin, Save, Upload, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { indiaSpecificMockData } from "@/app/api/project-management/mock-data";
import { CameraCapture } from "@/components/camera-capture";
import { getCurrentLocation, getAddressFromCoordinates } from "@/lib/location-utils";

// Attendance Check-In Component with GPS Photo capture
type Contributor = { id: string; name: string; role: string };

interface AttendanceCheckInDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSubmit: (data: any) => void;
  contributors: Contributor[];
}

export function AttendanceCheckInDialog({
  open,
  onClose,
  projectId,
  onSubmit,
  contributors
}: AttendanceCheckInDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [showCamera, setShowCamera] = React.useState(false);
  const [formData, setFormData] = React.useState({
    contributorId: "",
    location: null as { latitude: number; longitude: number } | null,
    notes: ""
  });
  const { toast } = useToast();

  // Use real camera access with WebRTC
  const handleCameraCapture = (photoDataUrl: string, metadata: any) => {
    setPhoto(photoDataUrl);
    
    if (metadata?.location) {
      // Make sure the location has latitude and longitude
      if (metadata.location.latitude !== undefined && metadata.location.longitude !== undefined) {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: metadata.location.latitude,
            longitude: metadata.location.longitude
          }
        }));
      }
    }
    
    setShowCamera(false);
    
    toast({
      title: "Photo captured",
      description: "Photo captured with location metadata"
    });
  };
  
  // Open camera
  const takePhoto = () => {
    setShowCamera(true);
  };

  // Get real GPS location
  const getLocation = async () => {
    try {
      if (!navigator.geolocation) {
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Geolocation is not supported by your browser"
        });
        return;
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // Use real location data with type safety
      setFormData(prev => ({
        ...prev,
        location: coordinates
      }));
      
      toast({
        title: "Location captured",
        description: `Coordinates: (${coordinates?.latitude?.toFixed(4) || 'N/A'}, ${coordinates?.longitude?.toFixed(4) || 'N/A'})`
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        variant: "destructive",
        title: "Location Error",
        description: "Could not access your location. Please check permissions."
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In real app, upload to server
      // Here we simulate API call
      setTimeout(() => {
        onSubmit({
          ...formData,
          photoUrl: photo,
          date: new Date(),
          entryTime: new Date()
        });
        
        setFormData({
          contributorId: "",
          location: null,
          notes: ""
        });
        setPhoto(null);
        
        toast({
          title: "Attendance recorded",
          description: "Contributor check-in was successful"
        });
        
        onClose();
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {showCamera ? (
          <CameraCapture 
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
            includeLocation={true}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Record Attendance</DialogTitle>
              <DialogDescription>
                Check in a contributor with photo and GPS verification
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Contributor</label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={formData.contributorId}
                  onChange={(e) => setFormData({...formData, contributorId: e.target.value})}
                  required
                >
                  <option value="">Select a contributor</option>
                  {contributors.map((c: Contributor) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={getLocation}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {formData.location ? "Location Captured" : "Get Location"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={takePhoto}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {photo ? "Retake Photo" : "Take Photo"}
                </Button>
              </div>
              
              {photo && (
                <div className="relative">
                  <img 
                    src={photo} 
                    alt="Attendance photo" 
                    className="w-full h-40 object-cover rounded-md" 
                  />
                  <Button 
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    onClick={() => setPhoto(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {formData.location && (
                <div className="bg-muted/50 p-2 rounded-md text-sm">
                  <div className="font-medium">Location Captured</div>
                  <div className="text-xs text-muted-foreground">
                    Lat: {formData.location?.latitude?.toFixed(4) || 'N/A'}, Lon: {formData.location?.longitude?.toFixed(4) || 'N/A'}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add any notes about today's work..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.contributorId || !photo || !formData.location}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                      Processing...
                    </>
                  ) : (
                    "Check In Contributor"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Daily Report Dialog Component
interface DailyReportDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSubmit: (data: any) => void;
}

export function DailyReportDialog({
  open,
  onClose,
  projectId,
  projectName,
  onSubmit
}: DailyReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState("summary");
  const [reportData, setReportData] = React.useState({
    progressSummary: "",
    tasksCompleted: "",
    challengesFaced: "",
    nextDayPlan: "",
    weatherConditions: indiaSpecificMockData.indianWeatherConditions[
      Math.floor(Math.random() * indiaSpecificMockData.indianWeatherConditions.length)
    ],
    materialsUsed: [] as { name: string; quantity: number; unit: string }[],
    fundingUtilization: [] as { amountSpent: number; description: string; category: string }[],
    environmentalImpactMetrics: {
      wasteCollected: "",
      treesPlanted: 0,
      areaRestored: "",
      waterConserved: ""
    },
    photos: [] as string[],
    communityEngagement: {
      localParticipants: 0,
      awarenessActivities: [] as string[]
    },
    governmentReportSubmitted: false
  });
  const [newMaterial, setNewMaterial] = React.useState({
    name: "",
    quantity: 0,
    unit: "units"
  });
  const [newFunding, setNewFunding] = React.useState({
    amountSpent: 0,
    description: "",
    category: "materials"
  });
  const { toast } = useToast();

  const addMaterial = () => {
    if (!newMaterial.name || newMaterial.quantity <= 0) {
      toast({ 
        title: "Invalid Material", 
        description: "Please provide name and quantity",
        variant: "destructive"
      });
      return;
    }
    
    setReportData(prev => ({
      ...prev,
      materialsUsed: [...prev.materialsUsed, {...newMaterial}]
    }));
    setNewMaterial({ name: "", quantity: 0, unit: "units" });
  };
  
  const addFunding = () => {
    if (newFunding.amountSpent <= 0 || !newFunding.description) {
      toast({ 
        title: "Invalid Expense", 
        description: "Please provide amount and description",
        variant: "destructive"
      });
      return;
    }
    
    setReportData(prev => ({
      ...prev,
      fundingUtilization: [...prev.fundingUtilization, {...newFunding}]
    }));
    setNewFunding({ amountSpent: 0, description: "", category: "materials" });
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // In real app, upload to server
      // Here we simulate API call
      setTimeout(() => {
        // Parse tasks into array
        const parsedTasks = reportData.tasksCompleted
          .split('\n')
          .filter(t => t.trim() !== '');
        
        onSubmit({
          ...reportData,
          tasksCompleted: parsedTasks,
          date: new Date()
        });
        
        toast({
          title: "Report Submitted",
          description: "Daily report has been submitted successfully"
        });
        
        onClose();
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Project Report</DialogTitle>
          <DialogDescription>
            {projectName} - {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${currentTab === 'summary' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('summary')}
            >
              Summary
            </button>
            <button
              className={`px-4 py-2 ${currentTab === 'resources' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('resources')}
            >
              Resources
            </button>
            <button
              className={`px-4 py-2 ${currentTab === 'impact' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('impact')}
            >
              Impact
            </button>
            <button
              className={`px-4 py-2 ${currentTab === 'photos' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('photos')}
            >
              Photos
            </button>
          </div>
          
          {/* Summary Tab */}
          {currentTab === 'summary' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Progress Summary</label>
                <Textarea
                  placeholder="Describe today's progress..."
                  value={reportData.progressSummary}
                  onChange={(e) => setReportData({...reportData, progressSummary: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tasks Completed (One per line)</label>
                <Textarea
                  placeholder="Enter completed tasks..."
                  value={reportData.tasksCompleted}
                  onChange={(e) => setReportData({...reportData, tasksCompleted: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Challenges Faced</label>
                  <Textarea
                    placeholder="Any challenges or issues..."
                    value={reportData.challengesFaced}
                    onChange={(e) => setReportData({...reportData, challengesFaced: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tomorrow's Plan</label>
                  <Textarea
                    placeholder="Plans for the next day..."
                    value={reportData.nextDayPlan}
                    onChange={(e) => setReportData({...reportData, nextDayPlan: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Weather Conditions</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={reportData.weatherConditions}
                  onChange={(e) => setReportData({...reportData, weatherConditions: e.target.value})}
                >
                  {indiaSpecificMockData.indianWeatherConditions.map((weather, index) => (
                    <option key={index} value={weather}>{weather}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {/* Resources Tab */}
          {currentTab === 'resources' && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Materials Used</h3>
                </div>
                
                {reportData.materialsUsed.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.materialsUsed.map((material, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">{material.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{material.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{material.unit}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setReportData(prev => ({
                                    ...prev,
                                    materialsUsed: prev.materialsUsed.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="text-xs font-medium">Material</label>
                    <select
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                      className="w-full border rounded-md p-2 mt-1"
                    >
                      <option value="">Select material</option>
                      {indiaSpecificMockData.materialCatalog.map((material, index) => (
                        <option key={index} value={material.name}>{material.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Quantity</label>
                    <Input
                      type="number"
                      value={newMaterial.quantity}
                      onChange={(e) => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})}
                      className="mt-1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Unit</label>
                    <select
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                      className="w-full border rounded-md p-2 mt-1"
                    >
                      <option value="units">Units</option>
                      <option value="kg">Kilograms</option>
                      <option value="sqm">Square Meters</option>
                      <option value="m">Meters</option>
                      <option value="liters">Liters</option>
                      <option value="sets">Sets</option>
                      <option value="packs">Packs</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addMaterial}
                  className="w-full"
                >
                  Add Material
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Funding Utilization</h3>
                </div>
                
                {reportData.fundingUtilization.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.fundingUtilization.map((fund, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">₹{fund.amountSpent.toLocaleString()}</td>
                            <td className="px-4 py-2">{fund.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{fund.category}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setReportData(prev => ({
                                    ...prev,
                                    fundingUtilization: prev.fundingUtilization.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="text-xs font-medium">Amount (₹)</label>
                    <Input
                      type="number"
                      value={newFunding.amountSpent}
                      onChange={(e) => setNewFunding({...newFunding, amountSpent: Number(e.target.value)})}
                      className="mt-1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Description</label>
                    <Input
                      value={newFunding.description}
                      onChange={(e) => setNewFunding({...newFunding, description: e.target.value})}
                      className="mt-1"
                      placeholder="Expense description..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Category</label>
                    <select
                      value={newFunding.category}
                      onChange={(e) => setNewFunding({...newFunding, category: e.target.value})}
                      className="w-full border rounded-md p-2 mt-1"
                    >
                      <option value="materials">Materials</option>
                      <option value="transportation">Transportation</option>
                      <option value="labor">Labor</option>
                      <option value="equipment">Equipment</option>
                      <option value="food">Food & Refreshments</option>
                      <option value="outreach">Community Outreach</option>
                      <option value="miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addFunding}
                  className="w-full"
                >
                  Add Expense
                </Button>
              </div>
            </div>
          )}
          
          {/* Impact Tab */}
          {currentTab === 'impact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Waste Collected (tons)</label>
                  <Input
                    value={reportData.environmentalImpactMetrics.wasteCollected}
                    onChange={(e) => setReportData({
                      ...reportData, 
                      environmentalImpactMetrics: {
                        ...reportData.environmentalImpactMetrics,
                        wasteCollected: e.target.value
                      }
                    })}
                    placeholder="Amount in tons..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trees Planted</label>
                  <Input
                    type="number"
                    value={reportData.environmentalImpactMetrics.treesPlanted}
                    onChange={(e) => setReportData({
                      ...reportData, 
                      environmentalImpactMetrics: {
                        ...reportData.environmentalImpactMetrics,
                        treesPlanted: Number(e.target.value)
                      }
                    })}
                    placeholder="Number of trees..."
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Area Restored (sqm)</label>
                  <Input
                    value={reportData.environmentalImpactMetrics.areaRestored}
                    onChange={(e) => setReportData({
                      ...reportData, 
                      environmentalImpactMetrics: {
                        ...reportData.environmentalImpactMetrics,
                        areaRestored: e.target.value
                      }
                    })}
                    placeholder="Area in square meters..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Water Conserved (liters)</label>
                  <Input
                    value={reportData.environmentalImpactMetrics.waterConserved}
                    onChange={(e) => setReportData({
                      ...reportData, 
                      environmentalImpactMetrics: {
                        ...reportData.environmentalImpactMetrics,
                        waterConserved: e.target.value
                      }
                    })}
                    placeholder="Volume in liters..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Local Participants (number)</label>
                <Input
                  type="number"
                  value={reportData.communityEngagement.localParticipants}
                  onChange={(e) => setReportData({
                    ...reportData, 
                    communityEngagement: {
                      ...reportData.communityEngagement,
                      localParticipants: Number(e.target.value)
                    }
                  })}
                  placeholder="Number of local participants..."
                  min="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="govReportCheck"
                  checked={reportData.governmentReportSubmitted}
                  onChange={(e) => setReportData({
                    ...reportData,
                    governmentReportSubmitted: e.target.checked
                  })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="govReportCheck" className="text-sm font-medium">
                  Submit to Government Authorities
                </label>
              </div>
              
              {reportData.governmentReportSubmitted && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                  <p>
                    This report will be submitted to relevant government authorities 
                    including the {indiaSpecificMockData.governmentOffices[
                      Math.floor(Math.random() * indiaSpecificMockData.governmentOffices.length)
                    ]}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Photos Tab */}
          {currentTab === 'photos' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Photos (Max 5)</label>
                  <span className="text-xs text-muted-foreground">
                    {reportData.photos.length}/5 photos
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {reportData.photos.map((photo, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden h-24">
                      <img 
                        src={photo || "/placeholder.jpg"} 
                        alt={`Report photo ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setReportData(prev => ({
                            ...prev,
                            photos: prev.photos.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {reportData.photos.length < 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        // In a real app, open file picker or camera
                        // Here we simulate with placeholder
                        setReportData(prev => ({
                          ...prev,
                          photos: [...prev.photos, "/placeholder.jpg"]
                        }));
                      }}
                      className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-24 hover:border-primary transition-colors"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {currentTab !== 'summary' && (
              <Button variant="ghost" onClick={() => {
                const tabs = ['summary', 'resources', 'impact', 'photos'];
                const currentIndex = tabs.indexOf(currentTab);
                setCurrentTab(tabs[currentIndex - 1]);
              }}>
                Previous
              </Button>
            )}
            {currentTab !== 'photos' && (
              <Button variant="ghost" onClick={() => {
                const tabs = ['summary', 'resources', 'impact', 'photos'];
                const currentIndex = tabs.indexOf(currentTab);
                setCurrentTab(tabs[currentIndex + 1]);
              }}>
                Next
              </Button>
            )}
          </div>
          
          <div>
            <Button variant="outline" className="mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !reportData.progressSummary}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
