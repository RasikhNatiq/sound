import React, { useState } from 'react';
import { FileAudio } from 'lucide-react';
import FileUpload from '../components/ui/FileUpload';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import PredictionList from '../components/ui/PredictionList';
import { continuousPredictAudio } from '../utils/api';
import { PredictionResult } from '../types';

const ContinuousPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

  };
  
  const handlePredict = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      const results = await continuousPredictAudio(selectedFile);
      setPredictions(results);
      console.log('Continuous prediction results:', results); // Debug log
    } catch (error) {
      console.error('Error with continuous prediction:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-[calc(100%-4rem)] bg-black text-white">
      <Header title="Continuous Prediction" />
      
      <div className="flex-1 p-5 overflow-auto">
        <div className="mb-6 text-center">
          <FileAudio className="w-12 h-12 mx-auto mb-2 text-indigo-500" />
          <h2 className="text-xl font-bold mb-2">Continuous Analysis</h2>
          <p className="text-gray-400 mb-4 text-sm">
            Upload an audio file for segment-by-segment prediction
          </p>
        </div>
        
        <div className="mb-6">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
        
        <div className="mb-8">
          <Button 
            isFullWidth 
            isLoading={isLoading}
            disabled={!selectedFile || isLoading}
            onClick={handlePredict}
          >
            Analyze Continuously
          </Button>
        </div>
        
        <div className="mt-8">
          <PredictionList predictions={predictions} />
        </div>
      </div>
    </div>
  );
};

export default ContinuousPage;