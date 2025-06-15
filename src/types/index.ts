export interface AudioChunk {
  buffer: AudioBuffer | null;
  blob: Blob | null;
  timestamp: number;
}

export interface PredictionResult {
  predicted_class: string;
  confidence: number;
  timestamp: number;
}

export interface AudioState {
  isRecording: boolean;
  isPredicting: boolean;
  audioChunks: AudioChunk[];
  predictions: PredictionResult[];
  selectedFile: File | null;
  recordingTime: number;
  startRecording: () => void;
  stopRecording: () => void;
  resetState: () => void;
  setSelectedFile: (file: File | null) => void;
  addPrediction: (prediction: PredictionResult) => void;
}