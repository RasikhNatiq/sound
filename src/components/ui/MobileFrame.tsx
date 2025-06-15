import React, { ReactNode, useState, useEffect } from 'react';

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [batteryPercentage, setBatteryPercentage] = useState<number>(100);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTime(formattedTime);
    };

    // Update time immediately
    updateTime();

    // Update time every second
    const interval = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Battery decreases by 1% every 10 seconds for demonstration
    // In real scenario, this would be much slower
    const batteryInterval = setInterval(() => {
      setBatteryPercentage(prev => {
        if (prev <= 1) {
          return 100; // Reset to 100% when it reaches 1% to keep the demo running
        }
        return prev - 1;
      });
    }, 10000); // Decrease every 10 seconds

    return () => clearInterval(batteryInterval);
  }, []);

  // Determine battery color based on percentage
  const getBatteryColor = (percentage: number) => {
    if (percentage > 50) return 'bg-green-800';
    if (percentage > 20) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // Calculate battery fill width based on percentage
  const getBatteryFillWidth = (percentage: number) => {
    return `${percentage}%`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="max-w-[350px] w-full h-[700px] bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-gray-800 relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-xl z-10"></div>
        
        {/* Status bar */}
        <div className="h-10 bg-black flex justify-between items-center px-6 pt-1 z-0">
          <div className="text-white text-xs">{currentTime}</div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 border-[1px] border-white rounded-sm relative bg-gray-800 overflow-hidden">
              <div 
                className={`h-full ${getBatteryColor(batteryPercentage)} transition-all duration-500 rounded-sm`}
                style={{ width: getBatteryFillWidth(batteryPercentage) }}
              ></div>
            </div>
            <div className="w-3 h-3 bg-red-900 rounded-full"></div>
            <div className="text-white text-xs">{batteryPercentage}%</div>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-black h-[calc(100%-10px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;