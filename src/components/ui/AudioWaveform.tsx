import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let source: MediaStreamAudioSourceNode;
    let stream: MediaStream;
    
    const startVisualization = async () => {
      try {
        // Initialize audio context and analyzer
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        // Get microphone stream
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Connect the microphone to the analyzer
        source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);
        
        // Start the animation
        animationRef.current = requestAnimationFrame(draw);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Get the current frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set up the line style
      ctx.lineWidth = 2;
      ctx.strokeStyle = isRecording ? '#ef4444' : '#6366f1';
      
      // Draw the waveform
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        ctx.beginPath();
        ctx.moveTo(x, height / 2 - barHeight / 2);
        ctx.lineTo(x, height / 2 + barHeight / 2);
        ctx.stroke();
        
        x += barWidth;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start visualization if recording
    if (isRecording) {
      startVisualization();
    }
    
    // Clean up on component unmount or when recording stops
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-32 bg-gray-900 rounded-lg"
      width={300}
      height={100}
    />
  );
};

export default AudioWaveform;