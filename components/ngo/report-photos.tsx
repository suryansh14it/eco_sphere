'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraCapture, FileUpload } from '@/components/camera-capture';
import { Camera, Upload, X, Plus, Image } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface DailyReportPhotosProps {
  photos: string[];
  onAddPhoto: (photoDataUrl: string, metadata?: any) => void;
  onRemovePhoto: (index: number) => void;
  maxPhotos?: number;
}

export function DailyReportPhotos({
  photos = [],
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 5
}: DailyReportPhotosProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'camera' | 'upload'>('camera');
  const { toast } = useToast();
  
  const handleOpenCamera = () => {
    setDialogMode('camera');
    setIsDialogOpen(true);
  };
  
  const handleOpenUpload = () => {
    setDialogMode('upload');
    setIsDialogOpen(true);
  };
  
  const handleCameraCapture = (photoDataUrl: string, metadata: any) => {
    onAddPhoto(photoDataUrl, metadata);
    setIsDialogOpen(false);
    toast({
      title: 'Photo added',
      description: 'The photo has been added to your report.'
    });
  };
  
  const handleFileUpload = (file: File, dataUrl: string) => {
    onAddPhoto(dataUrl, { file });
    setIsDialogOpen(false);
    toast({
      title: 'Photo added',
      description: 'The photo has been added to your report.'
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Photos</h3>
        <span className="text-xs text-muted-foreground">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-video bg-muted rounded-md overflow-hidden">
            <img 
              src={photo} 
              alt={`Report photo ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
              onClick={() => onRemovePhoto(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <div className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-md hover:border-primary hover:bg-muted/20 transition-colors">
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 mb-1 text-muted-foreground" />
              <span className="text-xs font-medium">Add Photo</span>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleOpenCamera}
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Camera
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleOpenUpload}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Dialog for camera/upload */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <Tabs defaultValue={dialogMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="camera" 
                onClick={() => setDialogMode('camera')}
                className="rounded-none"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                onClick={() => setDialogMode('upload')}
                className="rounded-none"
              >
                <Image className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className="m-0">
              <CameraCapture 
                onCapture={handleCameraCapture} 
                onClose={() => setIsDialogOpen(false)} 
                includeLocation={true} 
              />
            </TabsContent>
            <TabsContent value="upload" className="m-0 p-6">
              <h3 className="font-medium mb-4">Upload Photo</h3>
              <FileUpload onUpload={handleFileUpload} />
              <div className="flex justify-end mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PhotoGallery({ photos = [] }) {
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  
  // Open the photo viewer with the selected photo
  const openPhotoViewer = (index: number) => {
    setViewIndex(index);
  };
  
  // Close the photo viewer
  const closePhotoViewer = () => {
    setViewIndex(null);
  };
  
  // Go to the next photo
  const nextPhoto = () => {
    if (viewIndex === null || photos.length === 0) return;
    setViewIndex((viewIndex + 1) % photos.length);
  };
  
  // Go to the previous photo
  const prevPhoto = () => {
    if (viewIndex === null || photos.length === 0) return;
    setViewIndex((viewIndex - 1 + photos.length) % photos.length);
  };
  
  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <Card 
            key={index} 
            className="cursor-pointer overflow-hidden"
            onClick={() => openPhotoViewer(index)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Photo viewer dialog */}
      <Dialog open={viewIndex !== null} onOpenChange={closePhotoViewer}>
        <DialogContent className="sm:max-w-[800px] p-0">
          {viewIndex !== null && viewIndex >= 0 && viewIndex < photos.length && (
            <div className="relative">
              <img 
                src={photos[viewIndex]} 
                alt={`Photo ${viewIndex + 1}`} 
                className="w-full max-h-[70vh] object-contain"
              />
              
              <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <Button variant="ghost" className="text-white" onClick={prevPhoto}>
                  Previous
                </Button>
                <span>
                  {viewIndex + 1} / {photos.length}
                </span>
                <Button variant="ghost" className="text-white" onClick={nextPhoto}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
