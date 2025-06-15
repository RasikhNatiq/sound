import React, { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import PredictionList from '../components/ui/PredictionList';
import { getHistory } from '../utils/api';
import { PredictionResult } from '../types';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await getHistory();
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRefresh = () => {
    fetchHistory();
  };

  return (
    <div className="flex flex-col min-h-[calc(100%-4rem)] bg-black text-white">
      <Header title="Prediction History" />
      
      <div className="flex-1 p-5 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <History className="mr-2" size={20} />
            <span className="text-lg font-medium">Historical Predictions</span>
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2"
          >
            <RefreshCw 
              className={`${loading ? 'animate-spin' : ''}`} 
              size={16} 
            />
          </Button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <RefreshCw className="animate-spin mr-2" size={20} />
              <span className="text-gray-400">Loading history...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <Button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-4">
            {history.length > 0 ? (
              <div className="mb-4 text-sm text-gray-400">
                Total predictions: {history.length}
              </div>
            ) : null}
            <PredictionList predictions={history} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;