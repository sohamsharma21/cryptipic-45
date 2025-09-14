
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface SaveImageParams {
  userId: string;
  title: string;
  description?: string;
  imageFile: File;
  originalImageFile?: File;
  hasHiddenMessage: boolean;
  isEncrypted: boolean;
}

export interface SavedImageResult {
  id: string;
  path: string;
  originalPath?: string;
  publicUrl: string;
}

export const saveImageToStorage = async ({
  userId,
  title,
  description = '',
  imageFile,
  originalImageFile,
  hasHiddenMessage,
  isEncrypted,
}: SaveImageParams): Promise<SavedImageResult> => {
  const encodedImageId = uuidv4();
  const encodedImageName = `${encodedImageId}-${imageFile.name.replace(/\s+/g, '_')}`;
  const encodedImagePath = `${userId}/${encodedImageName}`;
  
  // Upload encoded image
  const { error: uploadError } = await supabase.storage
    .from('cryptipic')
    .upload(encodedImagePath, imageFile);
  
  if (uploadError) {
    throw new Error(`Error uploading image: ${uploadError.message}`);
  }
  
  // Upload original image if provided
  let originalImagePath = undefined;
  if (originalImageFile) {
    const originalImageId = uuidv4();
    const originalImageName = `original-${originalImageId}-${originalImageFile.name.replace(/\s+/g, '_')}`;
    originalImagePath = `${userId}/originals/${originalImageName}`;
    
    const { error: originalUploadError } = await supabase.storage
      .from('cryptipic')
      .upload(originalImagePath, originalImageFile);
    
    if (originalUploadError) {
      console.error('Error uploading original image:', originalUploadError);
      // Continue even if original upload fails
    }
  }
  
  // Save record in database
  const { data: imageRecord, error: dbError } = await supabase
    .from('stego_images')
    .insert({
      user_id: userId,
      title,
      description: description || null,
      encoded_image_path: encodedImagePath,
      original_image_path: originalImagePath || null,
      has_hidden_message: hasHiddenMessage,
      is_encrypted: isEncrypted,
    })
    .select()
    .single();
  
  if (dbError) {
    throw new Error(`Error saving image record: ${dbError.message}`);
  }
  
  // Get public URL
  const { data } = supabase.storage
    .from('cryptipic')
    .getPublicUrl(encodedImagePath);
  
  return {
    id: imageRecord.id,
    path: encodedImagePath,
    originalPath: originalImagePath,
    publicUrl: data.publicUrl,
  };
};

export const deleteImageFromStorage = async (imagePath: string) => {
  const { error } = await supabase.storage
    .from('cryptipic')
    .remove([imagePath]);
  
  if (error) {
    throw new Error(`Error deleting image: ${error.message}`);
  }
  
  return true;
};
