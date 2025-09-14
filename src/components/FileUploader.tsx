
import React, { useState, useRef } from 'react';
import { Upload, Image, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  className?: string;
  fileTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = "image/jpeg,image/png",
  label = "Upload an image",
  className = "",
  fileTypes = ['.jpg', '.jpeg', '.png'],
  multiple = false,
  maxFiles = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (multiple) {
      const validFiles = Array.from(files).filter(file => file.type.match('image.*'));
      if (validFiles.length > 0) {
        processMultipleFiles(validFiles);
      }
    } else if (files.length > 0) {
      processFile(files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (multiple) {
      const files = Array.from(e.target.files).filter(file => file.type.match('image.*'));
      processMultipleFiles(files);
    } else {
      processFile(e.target.files[0]);
    }
  };
  
  const processMultipleFiles = (files: File[]) => {
    // Limit to max files
    const newFiles = files.slice(0, maxFiles);
    setSelectedFiles(newFiles);
    
    // Generate preview for the first file
    if (newFiles.length > 0) {
      const url = URL.createObjectURL(newFiles[0]);
      setPreviewUrl(url);
      
      // Pass the first file to parent component
      onFileSelect(newFiles[0]);
    }
  };
  
  const processFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFiles([file]);
    
    // Pass file to parent component
    onFileSelect(file);
  };
  
  const selectFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelect(file);
  };
  
  const removeFile = (fileToRemove: File) => {
    const newFiles = selectedFiles.filter(file => file !== fileToRemove);
    setSelectedFiles(newFiles);
    
    if (newFiles.length > 0) {
      selectFile(newFiles[0]);
    } else {
      setPreviewUrl(null);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center w-full", 
      className
    )}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 w-full transition-colors cursor-pointer flex flex-col items-center justify-center",
          isDragging ? "border-crypti-purple bg-crypti-purple/10" : "border-gray-300 hover:border-crypti-purple/70 hover:bg-crypti-softBlue/50",
          previewUrl ? "py-4" : "py-12"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          accept={accept}
          multiple={multiple}
        />
        
        {previewUrl ? (
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="relative w-full max-w-md h-60 overflow-hidden rounded-md">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
            </div>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              className="mt-4"
            >
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? 'Select More Images' : 'Change Image'}
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-crypti-softBlue/70 p-4 rounded-full mb-4">
              <Upload className="h-8 w-8 text-crypti-purple" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">{label}</p>
              <p className="text-sm text-gray-500 mt-1">
                {multiple ? 'Drag and drop or click to browse multiple files' : 'Drag and drop or click to browse'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: {fileTypes.join(', ')}
              </p>
              {multiple && (
                <p className="text-xs text-gray-400 mt-1">
                  Maximum {maxFiles} files
                </p>
              )}
            </div>
          </>
        )}
      </div>
      
      {multiple && selectedFiles.length > 0 && (
        <div className="mt-4 w-full">
          <h4 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <Badge 
                key={`${file.name}-${index}`}
                variant="outline" 
                className="flex items-center gap-1 px-2 py-1"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="mt-2">
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-crypti-purple"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedFiles.length > 0) {
                  selectFile(selectedFiles[0]);
                }
              }}
            >
              Select first image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
