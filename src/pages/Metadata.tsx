import React, { useState } from 'react';
import Layout from '@/components/Layout';
import FileUploader from '@/components/FileUploader';
import MetadataViewer from '@/components/MetadataViewer';
import AdvancedDataExtractor from '@/components/metadata/AdvancedDataExtractor';
import { extractMetadata, Metadata, formatFileSize } from '@/utils/metadata';
import { FileImage } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const MetadataPage = () => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setSelectedFile(file);
    setProcessingStatus('Extracting metadata...');
    try {
      // Add a small delay to ensure the UI updates with the loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Extract metadata with enhanced logging
      console.log(`Processing file: ${file.name} (${formatFileSize(file.size)})`);
      const startTime = performance.now();
      
      const extractedMetadata = await extractMetadata(file);
      
      const endTime = performance.now();
      console.log(`Metadata extraction completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      setMetadata(extractedMetadata);
      
      toast({
        title: 'Metadata extraction complete',
        description: `Successfully analyzed ${file.name}`,
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Metadata extraction error:', error);
      toast({
        title: 'Error extracting metadata',
        description: error.message || 'Failed to extract metadata from the image.',
        variant: 'destructive',
      });
      setMetadata({
        error: 'Failed to extract metadata',
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
      });
    } finally {
      setLoading(false);
      setProcessingStatus(null);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-crypti-darkPurple">Image Metadata Extractor</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Upload an image to extract and view its complete metadata, including camera settings, location, and more.
            Our tool provides comprehensive technical details about your photos.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Upload Section */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="mr-2 h-5 w-5 text-crypti-purple" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Select an image to analyze its metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onFileSelect={handleFileSelect} 
                accept="image/jpeg,image/png,image/webp,image/tiff,image/heic"
                label="Upload an image to extract metadata"
                fileTypes={['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.heic']}
              />
              
              {loading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-crypti-purple border-t-transparent rounded-full"></div>
                  </div>
                  {processingStatus && (
                    <p className="text-center text-sm text-crypti-purple">{processingStatus}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata Viewer Section */}
          <div className="md:col-span-2 space-y-6">
            <MetadataViewer metadata={metadata} />
            <AdvancedDataExtractor file={selectedFile} />
          </div>
        </div>
        
        {/* Features and Privacy Notice */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Features */}
          <div className="p-4 bg-crypti-softBlue/10 rounded-lg border border-crypti-softBlue/20">
            <h3 className="font-medium text-crypti-darkPurple mb-2">Extended Features</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Extract details from JPEG, PNG, WebP, TIFF and HEIC images</li>
              <li>View complete EXIF, XMP, and IPTC metadata</li>
              <li>Analyze camera settings and lens information</li>
              <li>Check location data and image copyright</li>
              <li>Export metadata in JSON format</li>
            </ul>
          </div>
          
          {/* Privacy Notice */}
          <div className="p-4 bg-crypti-softBlue/30 rounded-lg border border-crypti-purple/20 text-sm text-gray-600">
            <h3 className="font-medium text-crypti-darkPurple mb-2">Privacy Assurance</h3>
            <p>
              All metadata extraction happens locally in your browser.
              Your images are never uploaded to any server, and your privacy is completely protected.
              The extracted information is only visible to you and is not stored or saved anywhere.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MetadataPage;
