import { create } from 'zustand';
import { AudioState, AudioChunk, PredictionResult } from '../types';
import { getAudioContext, createAudioChunk } from '../utils/audio';
import { streamPredictAudio } from '../utils/api';

const CHUNK_DURATION_MS = 3000; // 3 seconds per chunk

const useAudioStore = create<AudioState>((set, get) => ({
  isRecording: false,
  isPredicting: false,
  audioChunks: [],
  predictions: [],
  selectedFile: null,
  recordingTime: 0,
  
  startRecording: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = getAudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      let recordingStartTime = Date.now();
      let buffer: Float32Array[] = [];
      let lastChunkTime = Date.now();
      
      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        buffer.push(new Float32Array(inputData));
        
        const currentTime = Date.now();
        const elapsedSinceLastChunk = currentTime - lastChunkTime;
        
        // Update recording time
        set({ recordingTime: currentTime - recordingStartTime });
        
        // Create and process chunk if it's time
        if (elapsedSinceLastChunk >= CHUNK_DURATION_MS) {
          const audioContext = getAudioContext();
          const audioBuffer = audioContext.createBuffer(1, buffer.length * 4096, audioContext.sampleRate);
          
          // Combine all buffers
          let offset = 0;
          for (const segment of buffer) {
            audioBuffer.copyToChannel(segment, 0, offset);
            offset += segment.length;
          }
          
          // Create and add chunk
          const chunk = await createAudioChunk(audioBuffer);
          set(state => ({ audioChunks: [...state.audioChunks, chunk] }));
          
          // Process this chunk
          if (get().isPredicting) {
            try {
              const prediction = await streamPredictAudio(chunk);
              set(state => ({ predictions: [...state.predictions, prediction] }));
            } catch (error) {
              console.error('Error predicting chunk:', error);
            }
          }
          
          // Reset buffer and update last chunk time
          buffer = [];
          lastChunkTime = currentTime;
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      set({ 
        isRecording: true, 
        isPredicting: true,
        // Store references for later cleanup
        _cleanupFn: () => {
          stream.getTracks().forEach(track => track.stop());
          source.disconnect();
          processor.disconnect();
        }
      });
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  },
  
  stopRecording: () => {
    const state = get();
    if (state.isRecording && (state as any)._cleanupFn) {
      (state as any)._cleanupFn();
      set({ isRecording: false, isPredicting: false });
    }
  },
  
  resetState: () => {
    const state = get();
    if (state.isRecording) {
      state.stopRecording();
    }
    set({
      audioChunks: [],
      predictions: [],
      selectedFile: null,
      recordingTime: 0,
    });
  },
  
  setSelectedFile: (file: File | null) => {
    set({ selectedFile: file });
  },
  
  addPrediction: (prediction: PredictionResult) => {
    set(state => ({ predictions: [...state.predictions, prediction] }));
  },
}));

export default useAudioStore;