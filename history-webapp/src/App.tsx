import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Clock, Mic, Calendar, TrendingUp, Volume2, Timer, BarChart3 } from 'lucide-react';

interface PredictionResult {
  predicted_class: string;
  confidence: number;
  timestamp: string | number;
}

interface RecordingSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  predictions: PredictionResult[];
  totalDetections: number;
  dominantClass: string;
  averageConfidence: number;
}

const BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [nextUpdate, setNextUpdate] = useState<number>(180); // 3 minutes in seconds
  const [totalStats, setTotalStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    totalDetections: 0,
    mostCommonClass: ''
  });

  // Group predictions into recording sessions
  const groupPredictionsIntoSessions = (predictions: PredictionResult[]): RecordingSession[] => {
    if (predictions.length === 0) return [];

    // Sort predictions by timestamp
    const sortedPredictions = [...predictions].sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeA - timeB;
    });

    const sessions: RecordingSession[] = [];
    let currentSession: PredictionResult[] = [];
    let sessionStartTime = new Date(sortedPredictions[0].timestamp);
    
    // Group predictions that are within 30 seconds of each other into the same session
    const SESSION_GAP_MS = 30000; // 30 seconds

    for (let i = 0; i < sortedPredictions.length; i++) {
      const prediction = sortedPredictions[i];
      const predictionTime = new Date(prediction.timestamp);
      
      if (currentSession.length === 0) {
        currentSession.push(prediction);
        sessionStartTime = predictionTime;
      } else {
        const lastPredictionTime = new Date(currentSession[currentSession.length - 1].timestamp);
        const timeDiff = predictionTime.getTime() - lastPredictionTime.getTime();
        
        if (timeDiff <= SESSION_GAP_MS) {
          // Same session
          currentSession.push(prediction);
        } else {
          // New session - process current session first
          if (currentSession.length > 0) {
            const sessionEndTime = new Date(currentSession[currentSession.length - 1].timestamp);
            const duration = Math.max(1, (sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000);
            
            // Calculate dominant class
            const classCounts: { [key: string]: number } = {};
            let totalConfidence = 0;
            
            currentSession.forEach(pred => {
              classCounts[pred.predicted_class] = (classCounts[pred.predicted_class] || 0) + 1;
              totalConfidence += pred.confidence;
            });
            
            const dominantClass = Object.keys(classCounts).reduce((a, b) => 
              classCounts[a] > classCounts[b] ? a : b
            );
            
            sessions.push({
              id: `session-${sessionStartTime.getTime()}`,
              startTime: sessionStartTime,
              endTime: sessionEndTime,
              duration,
              predictions: [...currentSession],
              totalDetections: currentSession.length,
              dominantClass,
              averageConfidence: totalConfidence / currentSession.length
            });
          }
          
          // Start new session
          currentSession = [prediction];
          sessionStartTime = predictionTime;
        }
      }
    }
    
    // Process the last session
    if (currentSession.length > 0) {
      const sessionEndTime = new Date(currentSession[currentSession.length - 1].timestamp);
      const duration = Math.max(1, (sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000);
      
      const classCounts: { [key: string]: number } = {};
      let totalConfidence = 0;
      
      currentSession.forEach(pred => {
        classCounts[pred.predicted_class] = (classCounts[pred.predicted_class] || 0) + 1;
        totalConfidence += pred.confidence;
      });
      
      const dominantClass = Object.keys(classCounts).reduce((a, b) => 
        classCounts[a] > classCounts[b] ? a : b
      );
      
      sessions.push({
        id: `session-${sessionStartTime.getTime()}`,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        duration,
        predictions: [...currentSession],
        totalDetections: currentSession.length,
        dominantClass,
        averageConfidence: totalConfidence / currentSession.length
      });
    }

    return sessions.reverse(); // Show most recent first
  };

  // Calculate total statistics
  const calculateStats = (sessions: RecordingSession[]) => {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalDetections = sessions.reduce((sum, session) => sum + session.totalDetections, 0);
    
    // Find most common class across all sessions
    const allClasses: { [key: string]: number } = {};
    sessions.forEach(session => {
      session.predictions.forEach(pred => {
        allClasses[pred.predicted_class] = (allClasses[pred.predicted_class] || 0) + 1;
      });
    });
    
    const mostCommonClass = Object.keys(allClasses).length > 0 
      ? Object.keys(allClasses).reduce((a, b) => allClasses[a] > allClasses[b] ? a : b)
      : 'None';

    setTotalStats({
      totalSessions,
      totalDuration,
      totalDetections,
      mostCommonClass
    });
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      const historyData = result.history || [];
      
      if (!Array.isArray(historyData)) {
        throw new Error('Invalid history data format');
      }

      const sanitizedData = historyData.map((item) => ({
        predicted_class: item.predicted_class,
        confidence: typeof item.confidence === 'number' && !isNaN(item.confidence)
          ? item.confidence
          : 0,
        timestamp: item.timestamp,
      }));

      const groupedSessions = groupPredictionsIntoSessions(sanitizedData);
      setSessions(groupedSessions);
      calculateStats(groupedSessions);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 3 minutes
  useEffect(() => {
    fetchHistory();
    
    const refreshInterval = setInterval(() => {
      fetchHistory();
    }, 180000); // 3 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Countdown timer for next update
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setNextUpdate(prev => {
        if (prev <= 1) {
          return 180; // Reset to 3 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [lastUpdated]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getClassIcon = (className: string) => {
    switch (className.toLowerCase()) {
      case 'speech':
      case 'voice':
        return <Mic className="w-4 h-4" />;
      case 'music':
        return <Volume2 className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <History className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Audio Detection History</h1>
                <p className="text-purple-200">Real-time sound analysis dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-purple-200">Next update in</div>
                <div className="text-lg font-mono text-white">
                  {Math.floor(nextUpdate / 60)}:{(nextUpdate % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <button
                onClick={fetchHistory}
                disabled={loading}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{totalStats.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Duration</p>
                <p className="text-3xl font-bold text-white">{formatDuration(totalStats.totalDuration)}</p>
              </div>
              <Timer className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Detections</p>
                <p className="text-3xl font-bold text-white">{totalStats.totalDetections}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Most Common</p>
                <p className="text-xl font-bold text-white capitalize">{totalStats.mostCommonClass}</p>
              </div>
              {getClassIcon(totalStats.mostCommonClass)}
            </div>
          </div>
        </div>

        {/* Last Updated Info */}
        <div className="mb-6 text-center">
          <p className="text-purple-200">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <RefreshCw className="animate-spin w-6 h-6 text-purple-400" />
              <span className="text-xl text-white">Loading history...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-red-400 mb-4 text-lg">{error}</div>
              <button
                onClick={fetchHistory}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {!loading && !error && (
          <div className="space-y-6">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/5 rounded-xl p-8">
                  <History className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Recording History</h3>
                  <p className="text-purple-200">Start using the audio prediction app to see your history here.</p>
                </div>
              </div>
            ) : (
              sessions.map((session, index) => (
                <div 
                  key={session.id} 
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Session Header */}
                  <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Recording Session #{sessions.length - index}
                          </h3>
                          <p className="text-purple-200">
                            {formatDate(session.startTime)} at {formatTime(session.startTime)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {formatDuration(session.duration)}
                        </div>
                        <div className="text-purple-200 text-sm">Duration</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{session.totalDetections}</div>
                        <div className="text-purple-200 text-sm">Detections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white capitalize">{session.dominantClass}</div>
                        <div className="text-purple-200 text-sm">Dominant Class</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getConfidenceColor(session.averageConfidence)}`}>
                          {(session.averageConfidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-purple-200 text-sm">Avg Confidence</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Predictions List */}
                  <div className="p-6">
                    <h4 className="text-white font-medium mb-4">Detection Timeline</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {session.predictions.map((prediction, predIndex) => (
                        <div 
                          key={predIndex}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {getClassIcon(prediction.predicted_class)}
                            <div>
                              <div className="text-white font-medium capitalize">
                                {prediction.predicted_class}
                              </div>
                              <div className="text-purple-200 text-sm">
                                {new Date(prediction.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-bold ${getConfidenceColor(prediction.confidence)}`}>
                              {(prediction.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-purple-200 text-xs">Confidence</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;