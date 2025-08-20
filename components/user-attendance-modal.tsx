'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getCurrentLocation, getAddressFromCoordinates, isWithinProjectRadius } from '@/lib/location-utils';
import { MapPin, Camera, Upload, Loader2, CheckCircle, Clock, X, ImageIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";

interface UserAttendanceModalProps {
  project: {
    id: string;
    title: string;
    organization: string;
    location: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  attendanceType: 'checkin' | 'checkout';
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserAttendanceModal({ 
  project, 
  attendanceType,
  open, 
  onClose,
  onSuccess
}: UserAttendanceModalProps) {
  const [step, setStep] = useState<'location' | 'photo' | 'processing' | 'success'>('location');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<null | {
    latitude: number;
    longitude: number;
    address?: string;
  }>(null);
  const [locationError, setLocationError] = useState('');
  const [photoData, setPhotoData] = useState<null | { 
    dataUrl: string; 
    timestamp?: string; 
    location?: any; 
    file?: File;
    name?: string;
  }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const resetModal = () => {
    setStep('location');
    setNotes('');
    setLocation(null);
    setLocationError('');
    setPhotoData(null);
    setIsSubmitting(false);
    setIsGettingLocation(false);
    setIsUploadingPhoto(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Get user's current location
  const getCurrentUserLocation = async () => {
    setIsGettingLocation(true);
    setLocationError('');
    
    try {
      const position = await getCurrentLocation();
      const address = await getAddressFromCoordinates(position.latitude, position.longitude);
      
      setLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        address: address.address
      });

      // If project has coordinates, check if user is within project radius (500m)
      if (project.coordinates) {
        const isWithinRadius = await isWithinProjectRadius(
          position.latitude,
          position.longitude,
          project.coordinates.latitude,
          project.coordinates.longitude,
          500 // 500 meters radius
        );

        if (!isWithinRadius) {
          toast({
            title: "Location Verification Failed",
            description: "You must be within 500 meters of the project site to mark attendance.",
            variant: "destructive"
          });
          setLocationError('You must be within 500 meters of the project site.');
          return;
        }
      }

      toast({
        title: "Location Verified",
        description: "Your location has been verified successfully.",
      });
      
      setStep('photo');
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get your location. Please ensure location services are enabled.');
      toast({
        title: "Location Error",
        description: 'Failed to get your location. Please check your device settings.',
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (PNG, JPG, JPEG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Try to extract EXIF GPS data from the image
        const img = new Image();
        img.onload = () => {
          // For now, we'll use the current location instead of EXIF data
          // In a real implementation, you might use a library like exif-js to extract GPS data
          setPhotoData({
            dataUrl,
            timestamp: new Date().toISOString(),
            location: location, // Use the verified location
            file,
            name: file.name
          });
          
          toast({
            title: "Photo Uploaded",
            description: "Your geo-tagged photo has been uploaded successfully.",
          });
          
          // Don't automatically proceed to processing, let user click submit
        };
        img.src = dataUrl;
      };
      
      reader.onerror = () => {
        toast({
          title: "Upload Failed",
          description: "Failed to read the image file. Please try again.",
          variant: "destructive"
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Verify photo with OpenAI
  const verifyPhotoWithAI = async (photoData: string, projectLocation: string) => {
    try {
      const response = await fetch('/api/user/location-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: photoData,
          projectLocation: projectLocation,
          attendanceType: attendanceType,
          context: `Verify if this photo was taken at or near "${projectLocation}". Look for environmental features, landmarks, or any indicators that match this location. The photo should show the actual project site or immediate vicinity for ${attendanceType === 'checkin' ? 'check-in' : 'check-out'} verification.`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify photo with AI');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error verifying photo with AI:', error);
      throw error;
    }
  };

  // Submit attendance data
  const handleSubmitAttendance = async () => {
    if (!location || !photoData || !user) {
      toast({
        title: "Missing Information",
        description: "Please ensure location and photo are captured.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, verify the photo with AI
      toast({
        title: "Verifying Photo",
        description: "AI is analyzing your photo to verify the location...",
      });

      const aiVerification = await verifyPhotoWithAI(
        photoData.dataUrl, 
        project.location
      );

      // Check if AI verification passed
      if (!aiVerification.verified) {
        setStep('photo'); // Go back to photo step
        toast({
          title: "Photo Verification Failed",
          description: aiVerification.reason || "The uploaded photo doesn't appear to match the project location. Please upload a photo taken at the project site.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Photo Verified ✓",
        description: `Confidence: ${aiVerification.confidence}. ${aiVerification.reason}`,
      });

      // Prepare attendance data
      const attendanceData = {
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        type: attendanceType,
        timestamp: new Date().toISOString(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        photoData: photoData.dataUrl,
        notes: notes.trim(),
        projectTitle: project.title,
        organization: project.organization,
        aiVerification: aiVerification // Include AI verification results
      };

      // Submit to API
      const response = await fetch('/api/user/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit attendance');
      }

      const result = await response.json();
      
      setStep('success');
      
      toast({
        title: `${attendanceType === 'checkin' ? 'Check-in' : 'Check-out'} Successful`,
        description: `You have successfully ${attendanceType === 'checkin' ? 'checked in to' : 'checked out of'} ${project.title}.`,
      });

      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting attendance:', error);
      setStep('photo'); // Go back to photo step
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit attendance. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {attendanceType === 'checkin' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-600" />
            )}
            {attendanceType === 'checkin' ? 'Check In' : 'Check Out'}
          </DialogTitle>
        </DialogHeader>

        {!project ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No project selected</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-4 pr-2 pb-20">
              {/* Project Information */}
              <div className="bg-gray-50 p-3 rounded-lg flex-shrink-0">
                <h4 className="font-medium text-sm">{project.title}</h4>
                <p className="text-xs text-gray-600">{project.organization}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {project.location}
            </p>
          </div>

          {/* Step 1: Location Verification */}
          {step === 'location' && (
            <div className="space-y-4">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Verify Your Location</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We need to verify that you're at the project site before you can {attendanceType === 'checkin' ? 'check in' : 'check out'}.
                </p>
              </div>

              {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{locationError}</p>
                </div>
              )}

              {location && !locationError && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">Location Verified ✓</p>
                  <p className="text-xs text-green-600 mt-1">{location.address}</p>
                </div>
              )}

              <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t">
                <Button 
                  onClick={getCurrentUserLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Verify Location
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Photo Upload */}
          {step === 'photo' && (
            <div className="space-y-4">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Upload Geo-Tagged Photo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a photo taken at the project site to verify your {attendanceType === 'checkin' ? 'check-in' : 'check-out'}.
                </p>
              </div>

              <div className="space-y-3">
                <Textarea
                  placeholder="Add any notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="photo-upload">Select Photo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                    <Label 
                      htmlFor="photo-upload" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload a photo or drag and drop
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, JPEG up to 10MB
                          </span>
                        </>
                      )}
                    </Label>
                  </div>
                  
                  {photoData && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">
                          Photo uploaded: {photoData.name}
                        </span>
                      </div>
                      <div className="mt-2">
                        <img 
                          src={photoData.dataUrl} 
                          alt="Uploaded photo" 
                          className="w-full max-w-xs mx-auto rounded-lg border border-gray-200 max-h-40 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sticky bottom-0 bg-white pt-4 mt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep('location')}
                  className="flex-1"
                >
                  Back to Location
                </Button>
                <Button
                  onClick={() => {
                    setStep('processing');
                    handleSubmitAttendance();
                  }}
                  disabled={!photoData || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    `Submit ${attendanceType === 'checkin' ? 'Check-in' : 'Check-out'}`
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="font-medium mb-2">Processing {attendanceType === 'checkin' ? 'Check-in' : 'Check-out'}</h3>
              <p className="text-sm text-gray-600">
                AI is analyzing your photo and verifying location...
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This may take a few seconds
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-medium mb-2 text-green-700">
                {attendanceType === 'checkin' ? 'Check-in' : 'Check-out'} Successful!
              </h3>
              <p className="text-sm text-gray-600">
                Your attendance has been recorded successfully.
              </p>
            </div>
          )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
