'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CameraCapture, FileUpload } from '@/components/camera-capture';
import { getCurrentLocation, getAddressFromCoordinates, isWithinProjectRadius } from '@/lib/location-utils';
import { MapPin, Camera, Upload, Loader2 } from 'lucide-react';

// This is an example implementation of a proper attendance check-in with real camera and GPS functionality
type Site = { name: string; latitude: number; longitude: number };
type Contributor = { id: string; name: string; role: string };

interface RealAttendanceCheckInProps {
  projectId: string;
  projectSites: Site[];
  contributors: Contributor[];
  onSubmit: (data: any) => Promise<void> | void;
  open: boolean;
  onClose: () => void;
}

export function RealAttendanceCheckIn({ 
  projectId, 
  projectSites, 
  contributors, 
  onSubmit, 
  open, 
  onClose 
}: RealAttendanceCheckInProps) {
  const [step, setStep] = useState('form'); // 'form', 'camera', 'upload', 'processing'
  const [formData, setFormData] = useState({
    contributorId: '',
    notes: ''
  });
  const [location, setLocation] = useState<null | {
    latitude: number;
    longitude: number;
    address?: string;
    district?: string;
    state?: string;
    siteName?: string;
  }>(null);
  const [locationError, setLocationError] = useState('');
  const [photoData, setPhotoData] = useState<null | { dataUrl: string; timestamp?: string; location?: any; file?: File }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Handle getting the current location with real GPS
  const handleGetLocation = async () => {
    try {
      // Get the current location
      const coords = await getCurrentLocation();
      
      // Check if the user is at a valid project site
      let isAtSite = false;
      let closestSite = null;
      
      for (const site of projectSites) {
        if (isWithinProjectRadius(
          coords.latitude,
          coords.longitude,
          site.latitude,
          site.longitude,
          1 // 1km radius
        )) {
          isAtSite = true;
          closestSite = site;
          break;
        }
      }
      
      if (!isAtSite) {
        setLocationError('You are not at a recognized project site. Please ensure you are at the work location.');
        toast({
          variant: 'destructive',
          title: 'Location verification failed',
          description: 'You must be physically present at the project site to check in.'
        });
        return;
      }
      
      // Get the address from the coordinates
      const addressInfo = await getAddressFromCoordinates(coords.latitude, coords.longitude);
      
      setLocation({
        ...coords,
        address: addressInfo.address,
        district: addressInfo.district,
        state: addressInfo.state,
        siteName: closestSite?.name || 'Project Site'
      });
      
      setLocationError('');
      
      toast({
        title: 'Location verified',
        description: `Your location at ${addressInfo.district}, ${addressInfo.state} has been verified.`
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Could not get your location. Please ensure location services are enabled.');
      toast({
        variant: 'destructive',
        title: 'Location error',
        description: 'Failed to get your location. Please check your device settings.'
      });
    }
  };

  // Handle camera capture
  const handleCameraCapture = (photoDataUrl: string, metadata: any) => {
    setPhotoData({
      dataUrl: photoDataUrl,
      timestamp: metadata.timestamp,
      location: metadata.location
    });
    setStep('form');
    
    toast({
      title: 'Photo captured',
      description: 'Your photo has been successfully captured with location data embedded.'
    });
  };

  // Handle file upload
  const handleFileUpload = (file: File, dataUrl: string) => {
    setPhotoData({
      dataUrl,
      file,
      timestamp: new Date().toISOString()
    });
    setStep('form');
    
    toast({
      title: 'Photo uploaded',
      description: 'Your photo has been successfully uploaded.'
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contributorId) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please select a contributor.'
      });
      return;
    }
    
    if (!location) {
      toast({
        variant: 'destructive',
        title: 'Missing location',
        description: 'Please capture your location before submitting.'
      });
      return;
    }
    
    if (!photoData) {
      toast({
        variant: 'destructive',
        title: 'Missing photo',
        description: 'Please take a photo or upload an image before submitting.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would upload the photo to cloud storage first
      // For now we'll simulate the upload and just use the dataUrl
      
      // Prepare the check-in data
      const checkInData = {
        contributorId: formData.contributorId,
  contributorName: (contributors.find((c: Contributor) => c.id === formData.contributorId)?.name) || 'Unknown',
        date: new Date(),
        entryTime: new Date(),
        gpsLocationEntry: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        entryPhotoUrl: photoData.dataUrl, // In a real app, this would be the URL from cloud storage
        notes: formData.notes,
        projectId: projectId,
        status: 'present'
      };
      
      // Submit the check-in
      await onSubmit(checkInData);
      
      // Reset form
      setFormData({
        contributorId: '',
        notes: ''
      });
      setLocation(null);
      setPhotoData(null);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast({
        variant: 'destructive',
        title: 'Submission error',
        description: 'Failed to submit attendance. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'form' && (
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-4">Record Attendance</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Contributor
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.contributorId}
                  onChange={(e) => setFormData({...formData, contributorId: e.target.value})}
                  required
                >
                  <option value="">Select a contributor</option>
                  {contributors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Location Verification
                </label>
                {location ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm font-medium text-green-800">
                      {location.siteName}
                    </p>
                    <p className="text-xs text-green-600">
                      {location?.address || 'Unknown address'}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Lat: {location?.latitude?.toFixed(6) || 'N/A'}, Lng: {location?.longitude?.toFixed(6) || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Verify Location
                    </Button>
                    {locationError && (
                      <p className="text-xs text-red-600 mt-1">{locationError}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Photo Verification
                </label>
                {photoData ? (
                  <div className="relative">
                    <img 
                      src={photoData.dataUrl} 
                      alt="Verification photo" 
                      className="w-full h-40 object-cover rounded-md border"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="bg-white/80 backdrop-blur-sm"
                        onClick={() => setStep('camera')}
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        Retake
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setStep('camera')}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep('upload')}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <Textarea
                  placeholder="Add any notes about today's work..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.contributorId || !location || !photoData}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Check In Contributor'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {step === 'camera' && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setStep('form')}
            includeLocation={true}
          />
        )}
        
        {step === 'upload' && (
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-4">Upload Photo</h2>
            <FileUpload onUpload={handleFileUpload} />
            <div className="flex justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => setStep('form')}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
