
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Download, Eye, FileImage, Trash2 } from 'lucide-react';

type StegoImage = {
  id: string;
  title: string;
  description: string | null;
  encoded_image_path: string;
  is_encrypted: boolean;
  created_at: string;
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [images, setImages] = useState<StegoImage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load user's images
  useEffect(() => {
    const fetchImages = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('stego_images')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            throw error;
          }
          
          setImages(data || []);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error loading images",
            description: error.message || "Failed to load your saved images",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (user) {
      fetchImages();
    }
  }, [user]);

  const handleViewImage = (imageId: string) => {
    navigate(`/image/${imageId}`);
  };

  const handleDownloadImage = async (imagePath: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('cryptipic')
        .download(imagePath);
        
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download successful",
        description: "Image downloaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Failed to download image",
      });
    }
  };

  const handleDeleteImage = async (id: string, path: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        // Delete from database
        const { error: dbError } = await supabase
          .from('stego_images')
          .delete()
          .eq('id', id);
          
        if (dbError) {
          throw dbError;
        }
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('cryptipic')
          .remove([path]);
          
        if (storageError) {
          console.error("Storage delete error:", storageError);
          // Continue even if storage delete fails
        }
        
        // Update UI
        setImages(images.filter(img => img.id !== id));
        
        toast({
          title: "Delete successful",
          description: "Image deleted successfully",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: error.message || "Failed to delete image",
        });
      }
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <h1 className="text-3xl font-bold text-center mb-8 text-crypti-darkPurple">Loading...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-crypti-darkPurple">Your Saved Images</h1>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button 
                onClick={() => navigate('/hide')}
                className="bg-crypti-purple hover:bg-crypti-purple/90"
              >
                Hide New Message
              </Button>
              <Button 
                onClick={() => navigate('/reveal')}
                variant="outline"
                className="border-crypti-purple text-crypti-purple hover:bg-crypti-purple/10"
              >
                Reveal Message
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardHeader>
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <FileImage className="mx-auto h-16 w-16 text-crypti-purple/50 mb-4" />
              <h2 className="text-2xl font-semibold text-crypti-darkPurple mb-2">No Images Yet</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                You haven't saved any steganography images yet. Start by hiding a message in an image.
              </p>
              <Button 
                onClick={() => navigate('/hide')}
                className="bg-crypti-purple hover:bg-crypti-purple/90"
              >
                Hide Your First Message
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => {
                // Get the public URL for the image
                const imageUrl = supabase.storage
                  .from('cryptipic')
                  .getPublicUrl(image.encoded_image_path).data.publicUrl;
                  
                return (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={imageUrl} 
                        alt={image.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                      {image.is_encrypted && (
                        <div className="absolute top-2 right-2 bg-crypti-purple text-white px-2 py-1 text-xs rounded-full">
                          Encrypted
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle>{image.title}</CardTitle>
                      <CardDescription>
                        {image.description || 'No description'}
                        <div className="text-xs mt-1">
                          Created: {new Date(image.created_at).toLocaleDateString()}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center justify-center"
                        onClick={() => handleViewImage(image.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center justify-center"
                        onClick={() => handleDownloadImage(image.encoded_image_path, image.title)}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="flex items-center justify-center"
                        onClick={() => handleDeleteImage(image.id, image.encoded_image_path)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
