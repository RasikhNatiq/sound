import React, { useState } from 'react';
import FileUpload from '../components/ui/FileUpload';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import PredictionList from '../components/ui/PredictionList';
import { predictAudio } from '../utils/api';
import { PredictionResult } from '../types';

const LandingPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file (e.g., .mp3, .wav).');
      return;
    }
    setSelectedFile(file);
    setPredictions([]); // Clear stale predictions
  };
  
  const handlePredict = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      const result = await predictAudio(selectedFile);
      console.log('API response:', result); // Debug log
      setPredictions([result]); // Replace instead of append
    } catch (error: any) {
      console.error('Error predicting audio:', error);
      alert(`Failed to predict audio: ${error.message || 'Unknown error. Check server logs for details.'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-[calc(100%-4rem)] bg-black text-white">
      <Header title="Audio Prediction" />
      
      <div className="flex-1 p-5 overflow-auto">
        <div className="mb-8 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Audio Analysis</h2>
          <p className="text-gray-400 mb-6">
            Upload an audio file to get instant predictions
          </p>
        </div>
        
        <div className="mb-6">
          <FileUpload onFileSelect={handleFileSelect} accept="audio/*" />
        </div>
        
        <div className="mb-8">
          <Button 
            isFullWidth 
            isLoading={isLoading}
            disabled={!selectedFile || isLoading}
            onClick={handlePredict}
          >
            Analyze Audio
          </Button>
        </div>
        
        <div className="mt-8">
          <PredictionList predictions={predictions} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;