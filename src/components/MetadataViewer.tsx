
import React, { useState } from 'react';
import { Metadata } from '@/utils/metadata';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, Map, Camera, Settings, Info, Copyright, Palette, CameraOff, Share2 } from 'lucide-react';

interface MetadataViewerProps {
  metadata: Metadata | null;
}

const MetadataViewer: React.FC<MetadataViewerProps> = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  if (!metadata) {
    return (
      <Card className="w-full h-[550px] flex flex-col justify-center items-center">
        <CardHeader className="text-center">
          <CardTitle className="text-gray-500">No Metadata Available</CardTitle>
          <CardDescription>Upload an image to view its metadata</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <CameraOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 max-w-md">
            Select an image file to extract and analyze its technical details, camera information, location data, and more.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to render metadata sections
  const renderSection = (title: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-crypti-purple mb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(data).map(([key, value]) => {
            // Don't render raw data or empty/null values
            if (key === 'rawData' || value === null || value === undefined) return null;
            
            // If value is an object, recurse
            if (typeof value === 'object' && !Array.isArray(value)) {
              return renderSection(key, value);
            }
            
            // Format key name to make it more readable
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())
              .replace(/([a-z])(\d+)/g, '$1 $2');
            
            return (
              <div key={key} className="flex">
                <span className="font-medium text-gray-700 min-w-[140px] mr-2">
                  {formattedKey}:
                </span>
                <span className="text-gray-600 break-words">{String(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleDownloadJson = () => {
    try {
      const dataStr = JSON.stringify(metadata, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileName = metadata.fileName 
        ? `${metadata.fileName.split('.')[0]}_metadata.json` 
        : 'image_metadata.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      toast({
        title: "Metadata exported",
        description: "JSON file has been downloaded successfully",
      });
    } catch (error) {
      console.error("Error exporting metadata:", error);
      toast({
        title: "Export failed",
        description: "Could not export metadata to JSON",
        variant: "destructive",
      });
    }
  };

  const handleCopyMetadata = () => {
    try {
      const dataStr = JSON.stringify(metadata, null, 2);
      navigator.clipboard.writeText(dataStr);
      
      toast({
        title: "Metadata copied",
        description: "JSON data has been copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying metadata:", error);
      toast({
        title: "Copy failed",
        description: "Could not copy metadata to clipboard",
        variant: "destructive",
      });
    }
  };

  // Open location in maps if GPS coordinates are available
  const openLocationInMaps = () => {
    if (metadata.location?.latitude && metadata.location?.longitude) {
      const lat = metadata.location.latitude;
      const lng = metadata.location.longitude;
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    } else {
      toast({
        title: "No location data",
        description: "This image doesn't contain GPS coordinates",
        variant: "destructive",
      });
    }
  };

  // Handle error case
  if (metadata.error) {
    return (
      <Card className="w-full border-red-300">
        <CardHeader>
          <CardTitle className="text-red-500">Metadata Extraction Error</CardTitle>
          <CardDescription>{metadata.error}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderSection('File Information', {
            fileName: metadata.fileName,
            fileSize: metadata.fileSize,
            fileType: metadata.fileType,
          })}
        </CardContent>
      </Card>
    );
  }

  // Filter out the rawData for the main view
  const { rawData, ...filteredMetadata } = metadata;

  // Get tabs to display based on available data
  const getTabs = () => {
    const tabs = [{ id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> }];
    
    if (metadata.camera || metadata.settings || metadata.lens)
      tabs.push({ id: 'camera', label: 'Camera', icon: <Camera className="h-4 w-4" /> });
    
    if (metadata.photo || metadata.settings)
      tabs.push({ id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> });
      
    if (metadata.location)
      tabs.push({ id: 'location', label: 'Location', icon: <Map className="h-4 w-4" /> });
      
    if (metadata.rights)
      tabs.push({ id: 'rights', label: 'Rights', icon: <Copyright className="h-4 w-4" /> });
      
    if (metadata.color || metadata.advanced)
      tabs.push({ id: 'advanced', label: 'Advanced', icon: <Palette className="h-4 w-4" /> });

    return tabs;
  };

  return (
    <Card className="w-full border-crypti-purple/20 h-[550px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-crypti-purple/10 to-crypti-softBlue/30 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-crypti-darkPurple">
              Image Metadata
            </CardTitle>
            <CardDescription>
              {metadata.fileName ? `Details for ${metadata.fileName}` : 'Details extracted from your image'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyMetadata}
              title="Copy metadata as JSON"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadJson}
              title="Download metadata as JSON"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {metadata.fileType && (
            <Badge variant="outline" className="bg-crypti-softBlue/20">
              {metadata.fileType.split('/')[1]?.toUpperCase() || 'Image'}
            </Badge>
          )}
          {metadata.photo?.width && metadata.photo?.height && (
            <Badge variant="outline" className="bg-crypti-softBlue/20">
              {metadata.photo.width} × {metadata.photo.height}
            </Badge>
          )}
          {metadata.settings?.iso && (
            <Badge variant="outline" className="bg-crypti-softBlue/20">
              ISO {metadata.settings.iso}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-0">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mb-4">
            {getTabs().map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="flex-grow pr-4">
            <TabsContent value="overview" className="m-0">
              {/* Basic File Info */}
              {renderSection('File Information', {
                fileName: metadata.fileName,
                fileSize: metadata.fileSize,
                fileType: metadata.fileType,
                lastModified: metadata.lastModified,
                dimensions: metadata.photo ? `${metadata.photo.width} × ${metadata.photo.height}` : undefined,
                aspectRatio: metadata.photo?.aspectRatio,
              })}
              
              <Separator className="my-4" />
              
              {/* Camera Overview */}
              {metadata.camera && (
                <>
                  {renderSection('Camera', {
                    make: metadata.camera.make,
                    model: metadata.camera.model,
                  })}
                  <Separator className="my-4" />
                </>
              )}
              
              {/* Photo Basic Details */}
              {metadata.photo && renderSection('Photo Details', {
                dateTaken: metadata.photo.dateTaken,
                dimensions: `${metadata.photo.width} × ${metadata.photo.height}`,
                aspectRatio: metadata.photo.aspectRatio,
              })}
              
              {/* Location Brief */}
              {metadata.location && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-crypti-purple mb-2">Location</h3>
                    <p className="mb-2">{metadata.location.coordinates}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={openLocationInMaps}
                      className="text-xs"
                    >
                      <Map className="h-3 w-3 mr-1" />
                      View on Map
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="camera" className="m-0">
              {/* Camera Info */}
              {metadata.camera && renderSection('Camera Information', metadata.camera)}
              
              {/* Lens Info */}
              {metadata.lens && (
                <>
                  <Separator className="my-4" />
                  {renderSection('Lens Information', metadata.lens)}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="m-0">
              {/* Camera Settings */}
              {metadata.settings && renderSection('Camera Settings', metadata.settings)}
              
              {/* Photo Details */}
              {metadata.photo && (
                <>
                  <Separator className="my-4" />
                  {renderSection('Photo Details', metadata.photo)}
                </>
              )}
              
              {/* Software Info */}
              {metadata.software && (
                <>
                  <Separator className="my-4" />
                  {renderSection('Software Information', metadata.software)}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="location" className="m-0">
              {/* Location Data */}
              {metadata.location && (
                <>
                  {renderSection('Location Information', metadata.location)}
                  <div className="mt-4">
                    <Button 
                      variant="outline"
                      onClick={openLocationInMaps}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="rights" className="m-0">
              {/* Copyright Info */}
              {metadata.rights && renderSection('Copyright Information', metadata.rights)}
              
              {/* IPTC Info */}
              {metadata.iptc && Object.keys(metadata.iptc).length > 0 && (
                <>
                  <Separator className="my-4" />
                  {renderSection('IPTC Metadata', metadata.iptc)}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="advanced" className="m-0">
              {/* Color Info */}
              {metadata.color && renderSection('Color Information', metadata.color)}
              
              {/* Advanced Info */}
              {metadata.advanced && Object.keys(metadata.advanced).length > 0 && (
                <>
                  <Separator className="my-4" />
                  {renderSection('Advanced Technical Information', metadata.advanced)}
                </>
              )}
              
              {/* Raw Data Option */}
              {rawData && Object.keys(rawData).length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-crypti-purple mb-2">Raw Metadata</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-auto max-h-60">
                      <pre>{JSON.stringify(rawData, null, 2)}</pre>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 text-xs text-gray-500 flex justify-between items-center">
        <div>
          {metadata.fileSize && (
            <span>File size: {metadata.fileSize}</span>
          )}
        </div>
        <div className="text-right">
          {metadata.camera?.make && metadata.camera?.model && (
            <span>{metadata.camera.make} {metadata.camera.model}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MetadataViewer;
