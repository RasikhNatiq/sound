import { AudioChunk } from '../types';

// AudioContext singleton
let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Create a chunk from the audio buffer
export const createAudioChunk = async (
  audioBuffer: AudioBuffer
): Promise<AudioChunk> => {
  // Convert AudioBuffer to WAV format
  const wav = audioBufferToWav(audioBuffer);
  const blob = new Blob([wav], { type: 'audio/wav' });

  return {
    buffer: audioBuffer,
    blob,
    timestamp: Date.now(),
  };
};

// Convert AudioBuffer to WAV format
export const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const numOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numOfChannels * 2;
  const data = new DataView(new ArrayBuffer(44 + length));

  // WAV header
  writeString(data, 0, 'RIFF');
  data.setUint32(4, 36 + length, true);
  writeString(data, 8, 'WAVE');
  writeString(data, 12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, numOfChannels, true);
  data.setUint32(24, sampleRate, true);
  data.setUint32(28, sampleRate * numOfChannels * 2, true);
  data.setUint16(32, numOfChannels * 2, true);
  data.setUint16(34, 16, true);
  writeString(data, 36, 'data');
  data.setUint32(40, length, true);

  // Write the PCM samples
  const channels = [];
  for (let i = 0; i < numOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      data.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return data.buffer;
};

// Helper function to write strings to DataView
const writeString = (dataView: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    dataView.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Convert a Blob to a base64 string
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove the data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Load audio file and convert to AudioBuffer
export const loadAudioFile = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = getAudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
};