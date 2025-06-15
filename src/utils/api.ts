import { AudioChunk, PredictionResult } from '../types';
import { blobToBase64 } from './audio';

const BASE_URL = "http://127.0.0.1:8000"; // Replace with actual URL in production

export const predictAudio = async (audioFile: File): Promise<PredictionResult> => {
  try {
    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      throw new Error('Invalid file type. Please upload an audio file.');
    }

    const formData = new FormData();
    formData.append('audio', audioFile, audioFile.name);

    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
    console.log('API response status:', response); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const result: PredictionResult = await response.json();
    // Sanitize confidence
    const confidence = typeof result.confidence === 'number' && !isNaN(result.confidence)
      ? result.confidence
      : 0;
    return { ...result, confidence };
  } catch (error) {
    console.error('Error predicting audio:', error);
    throw error;
  }
};

export const streamPredictAudio = async (chunk: AudioChunk): Promise<PredictionResult> => {
  try {
    if (!chunk.blob) {
      throw new Error('No audio data in chunk');
    }

    const formData = new FormData();
    formData.append('audio', chunk.blob, `chunk_${chunk.timestamp}.wav`);
    formData.append('timestamp', chunk.timestamp.toString());

    const response = await fetch(`${BASE_URL}/stream_predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const result: PredictionResult = await response.json();
    const confidence = typeof result.confidence === 'number' && !isNaN(result.confidence)
      ? result.confidence
      : 0;
    return { ...result, confidence };
  } catch (error) {
    console.error('Error streaming prediction:', error);
    throw error;
  }
};

export const continuousPredictAudio = async (audioFile: File): Promise<PredictionResult[]> => {
  try {
    if (!audioFile.type.startsWith('audio/')) {
      throw new Error('Invalid file type. Please upload an audio file.');
    }

    const formData = new FormData();
    formData.append('audio', audioFile, audioFile.name);

    const response = await fetch(`${BASE_URL}/continuous_predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const results = await response.json();
    // Handle non-array responses
    if (!Array.isArray(results)) {
      if (results && typeof results === 'object' && 'error' in results) {
        throw new Error(`Server error: ${results.error}`);
      }
      // Convert single object to array
      if (results && typeof results === 'object') {
        return [{
          ...results,
          confidence: typeof results.confidence === 'number' && !isNaN(results.confidence)
            ? results.confidence
            : 0,
        }];
      }
      // Return empty array for unexpected cases
      return [];
    }

    return results.map((result) => {
      const confidence = typeof result.confidence === 'number' && !isNaN(result.confidence)
        ? result.confidence
        : 0;
      return { ...result, confidence };
    });
  } catch (error) {
    console.error('Error with continuous prediction:', error);
    throw error;
  }
};

export const getHistory = async (): Promise<PredictionResult[]> => {
  try {
    const response = await fetch(`${BASE_URL}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const result = await response.json();
    
    // Handle the response format: {'history': [...]}
    const historyData = result.history || [];
    
    if (!Array.isArray(historyData)) {
      throw new Error('Invalid history data format');
    }

    return historyData.map((item) => ({
      predicted_class: item.predicted_class,
      confidence: typeof item.confidence === 'number' && !isNaN(item.confidence)
        ? item.confidence
        : 0,
      timestamp: item.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};