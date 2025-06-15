import React, { useEffect, useState } from 'react';
import { Mic, StopCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import AudioWaveform from '../components/ui/AudioWaveform';
import PredictionList from '../components/ui/PredictionList';
import useAudioStore from '../store/audioStore';

const RealTimePage: React.FC = () => {
  const { 
    isRecording, 
    predictions, 
    startRecording, 
    stopRecording, 
    resetState,
    recordingTime
  } = useAudioStore();
  
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  
  useEffect(() => {
    // Format the recording time
    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    setElapsedTime(formatTime(recordingTime));
    
    // Set up interval to update time while recording
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setElapsedTime(formatTime(useAudioStore.getState().recordingTime));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingTime]);
  
  const handleStartRecording = () => {
    resetState();
    startRecording();
  };
  
  const handleStopRecording = () => {
    stopRecording();
  };
  
  return (
    <div className="flex flex-col min-h-[calc(100%-4rem)] bg-black text-white">
      <Header title="Real-Time Prediction" />
      
      <div className="flex-1 p-5 overflow-auto">
        <div className="mb-6">
          <AudioWaveform isRecording={isRecording} />
          
          <div className="text-center mt-2">
            <span className={`text-lg font-mono ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
              {elapsedTime}
            </span>
          </div>
        </div>
        
        <div className="flex justify-center mb-8">
          {!isRecording ? (
            <Button 
              onClick={handleStartRecording}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4"
            >
              <div className="flex items-center">
                <Mic className="mr-2" size={20} />
                Start Recording
              </div>
            </Button>
          ) : (
            <Button 
              variant="secondary"
              onClick={handleStopRecording}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4"
            >
              <div className="flex items-center">
                <StopCircle className="mr-2" size={20} />
                Stop Recording
              </div>
            </Button>
          )}
        </div>
        
        <div className="mt-6">
          <PredictionList predictions={predictions} />
        </div>
      </div>
    </div>
  );
};

export default RealTimePage;