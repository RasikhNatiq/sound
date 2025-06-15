import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import Button from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect,
  accept = 'audio/*' 
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
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
    if (files && files.length > 0) {
      const file = files[0];
      // Check if the file is an audio file
      if (file.type.startsWith('audio/')) {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        alert('Please upload an audio file');
      }
    }
  };
  
  return (
    <div 
      className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
        isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 bg-gray-800/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center">
        <Upload className="text-gray-400 mb-3 w-12 h-12" />
        <p className="text-sm text-gray-300 mb-2">
          Drag &amp; drop your audio file here, or
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleButtonClick}
        >
          Choose File
        </Button>
        
        {fileName && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-sm text-gray-300 w-full truncate">
            {fileName}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;