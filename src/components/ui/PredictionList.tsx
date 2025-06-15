import React from 'react';
import { PredictionResult } from '../../types';

interface PredictionListProps {
  predictions: PredictionResult[];
}

const PredictionList: React.FC<PredictionListProps> = ({ predictions }) => {
  // Get current URL path to determine prediction format
  const currentPath = window.location.pathname;
  
  // Sanitize confidence value
  const getValidConfidence = (confidence: number | undefined): number => {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      console.warn('Invalid confidence value, defaulting to 0');
      return 0;
    }
    return Math.max(0, Math.min(1, confidence)); // Clamp between 0 and 1
  };

  // Sanitize timestamp - handles both number and string timestamps
  const getValidTimestamp = (timestamp: number | string | undefined): string => {
    if (!timestamp) {
      return new Date().toLocaleTimeString(); // Fallback to current time
    }
    
    // Handle string timestamp (like "2025-05-31 02:34:11.375896")
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString(); // Show both date and time for real-time predictions
      }
      return new Date().toLocaleTimeString(); // Fallback if string is invalid
    }
    
    // Handle number timestamp
    if (typeof timestamp === 'number' && !isNaN(timestamp)) {
      return new Date(timestamp).toLocaleTimeString();
    }
    
    return new Date().toLocaleTimeString(); // Final fallback
  };

  // Format time for continuous predictions (seconds to readable format)
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds}`;
  };

  // Determine which predictions to display based on URL
  const getDisplayPredictions = () => {
    if (currentPath === '/real-time') {
      // Handle real-time prediction format
      if (predictions.length > 0) {
        // Process all predictions to handle both formats
        const processedPredictions: any[] = [];
        
        predictions.forEach((pred) => {
          if (pred.predicted_class && Array.isArray(pred.predicted_class)) {
            // Convert real-time format to display format
            processedPredictions.push({
              predicted_class: pred.predicted_class[0],
              confidence: pred.predicted_class[1],
              timestamp: pred.timestamp // Use the actual timestamp from API
            });
          } else {
            // Handle standard format - keep original timestamp
            processedPredictions.push({
              predicted_class: pred.predicted_class,
              confidence: pred.confidence,
              timestamp: pred.timestamp // Use the actual timestamp from API
            });
          }
        });
        
        // Sort predictions by timestamp (latest first)
        processedPredictions.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA; // Descending order (latest first)
        });
        
        return processedPredictions;
      }
      // Return empty array instead of dummy data
      return [];
    }
    if (currentPath === '/continuous') {
      // Handle continuous prediction format where data is nested in predicted_class array
      if (predictions.length > 0 && predictions[0].predicted_class && Array.isArray(predictions[0].predicted_class)) {
        return predictions[0].predicted_class;
      }
    }
    if (currentPath === '/history') {
      // Handle history format - similar to real-time but already in correct format
      const sortedPredictions = [...predictions].sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA; // Descending order (latest first)
      });
      return sortedPredictions;
    }
    
    // For other routes, also sort by timestamp if available
    const sortedPredictions = [...predictions].sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA; // Descending order (latest first)
    });
    
    return sortedPredictions;
  };

  const displayPredictions = getDisplayPredictions();

  if (displayPredictions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        {currentPath === '/real-time' ? 'Start speaking to see predictions...' : 
         currentPath === '/history' ? 'No prediction history found.' : 
         'No predictions yet'}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-gray-300 font-medium mb-2">
        {currentPath === '/continuous' ? 'Continuous Prediction Results' : 
         currentPath === '/real-time' ? 'Real-time Prediction Results' :
         currentPath === '/history' ? 'Historical Prediction Results' : 
         'Prediction Results'}
      </h3>
      
      {displayPredictions.map((prediction, index) => {
        let confidence: number;
        let predictedClass: string;
        let timeString: string;
        let startTime: string | null = null;
        let endTime: string | null = null;

        // Handle different prediction formats based on URL
        if (currentPath === '/continuous') {
          // For continuous predictions: array format [startTime, endTime, predictedClass, confidence]
          if (Array.isArray(prediction)) {
            startTime = formatTime(prediction[0]);
            endTime = formatTime(prediction[1]);
            predictedClass = prediction[2] || 'Unknown prediction';
            confidence = getValidConfidence(prediction[3]);
            timeString = `${startTime} - ${endTime}`;
          } else {
            // Fallback if not array format
            confidence = getValidConfidence(prediction.confidence);
            predictedClass = prediction.predicted_class || 'Unknown prediction';
            timeString = getValidTimestamp(prediction.timestamp);
          }
        } else {
          // For home and real-time: standard object format
          confidence = getValidConfidence(prediction.confidence);
          predictedClass = prediction.predicted_class || 'Unknown prediction';
          timeString = getValidTimestamp(prediction.timestamp); // This will now properly handle string timestamps
        }
        
        // Calculate confidence color
        let confidenceColor = 'text-red-500';
        if (confidence >= 0.7) {
          confidenceColor = 'text-green-500';
        } else if (confidence >= 0.4) {
          confidenceColor = 'text-yellow-500';
        }
        
        return (
          <div 
            key={`${index}-${prediction.timestamp || Date.now()}`} 
            className={`bg-gray-800 rounded-lg p-4 ${currentPath !== '/real-time' ? 'animate-fadeIn' : ''}`}
            style={currentPath !== '/real-time' ? { animationDelay: `${index * 0.1}s` } : {}}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-medium">
                  {predictedClass}
                </div>
                <div className={`text-sm font-medium ${confidenceColor}`}>
                  Confidence: {(confidence * 100).toFixed(1)}%
                </div>
                {currentPath === '/continuous' && startTime && endTime && (
                  <div className="text-xs text-blue-400 mt-1">
                    Duration: {startTime} - {endTime}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {currentPath === '/continuous' && startTime && endTime ? 
                  `${startTime} - ${endTime}` : timeString}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PredictionList;