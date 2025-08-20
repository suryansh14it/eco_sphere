'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoDataUrl: string, metadata?: any) => void;
  onClose: () => void;
  includeLocation?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  onClose,
  includeLocation = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);

  // Start the camera
  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Could not access the camera. Please ensure you have given permission.');
      console.error('Error accessing camera:', err);
    }
  }, []);

  // Get current location
  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setLocation(coords);
      return coords;
    } catch (err) {
      setError('Could not get your location. Please ensure location services are enabled.');
      console.error('Error getting location:', err);
      return null;
    }
  }, []);

  // Take a photo
  const takePhoto = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Flip the image horizontally if using front camera
    // context.scale(-1, 1);
    // context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
    
    // For rear camera (no flip needed)
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    // Get location if needed
    let locationData = null;
    if (includeLocation) {
      locationData = location || await getLocation();
    }
    
    // Add timestamp and location to the image
    if (locationData || true) {
      context.font = '14px Arial';
      context.fillStyle = 'white';
      context.strokeStyle = 'black';
      context.lineWidth = 0.5;
      
      const timestamp = new Date().toISOString();
      const timestampText = `Date: ${timestamp.split('T')[0]} Time: ${timestamp.split('T')[1].split('.')[0]}`;
      
      context.fillText(timestampText, 10, canvas.height - 45);
      context.strokeText(timestampText, 10, canvas.height - 45);
      
      if (locationData) {
        const locationText = `Lat: ${locationData.latitude.toFixed(6)}, Lng: ${locationData.longitude.toFixed(6)}`;
        context.fillText(locationText, 10, canvas.height - 25);
        context.strokeText(locationText, 10, canvas.height - 25);
      }
    }
    
    // Convert to data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    setPhoto(photoDataUrl);
    
    // Stop the camera
    stopCamera();
    
    // Return the photo data
    return { photoDataUrl, metadata: { timestamp: new Date().toISOString(), location: locationData } };
  };

  // Stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  // Submit the photo
  const submitPhoto = () => {
    if (photo) {
      onCapture(photo, { timestamp: new Date().toISOString(), location });
    }
  };

  // Reset the camera
  const resetCamera = () => {
    setPhoto(null);
    startCamera();
  };

  // Initialize the camera when component mounts
  React.useEffect(() => {
    startCamera();
    if (includeLocation) {
      getLocation();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera, getLocation, includeLocation, stream]);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">Camera Capture</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-8 w-8 p-0 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative w-full h-80 bg-black">
        {isActive && !photo && (
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            autoPlay 
            playsInline
            muted
          />
        )}
        
        {photo && (
          <div className="relative w-full h-full">
            <img 
              src={photo} 
              alt="Captured" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {location && (
          <div className="text-xs text-muted-foreground">
            Location: Lat {location.latitude.toFixed(6)}, Lng {location.longitude.toFixed(6)}
          </div>
        )}
        
        <div className="flex justify-between gap-2">
          {!photo ? (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={takePhoto} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!isActive}
              >
                <Camera className="h-4 w-4 mr-2" /> 
                Take Photo
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetCamera} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button 
                onClick={submitPhoto} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// File Upload Component
interface FileUploadProps {
  onUpload: (file: File, dataUrl: string) => void;
  accept?: string;
  maxSizeInMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = "image/*",
  maxSizeInMB = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`File is too large. Maximum size is ${maxSizeInMB}MB.`);
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        onUpload(file, e.target.result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm font-medium">Click or drag to upload an image</p>
      <p className="text-xs text-muted-foreground mt-1">Maximum file size: {maxSizeInMB}MB</p>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
