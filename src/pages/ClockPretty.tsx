
import React, { useState, useEffect } from 'react';

interface SingleTimer {
  id: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  elapsedMinutes: number;
  elapsedSeconds: number;
  currentPauseDuration: number;
  initialTime?: { minutes: number; seconds: number };
  name?: string;
}

interface ClockData {
  timers: SingleTimer[];
  activeTimerId: number | null;
  clockPrettyHeader?: string;
}

const ClockPretty = () => {
  const [clockData, setClockData] = useState<ClockData>({
    timers: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      minutes: 5,
      seconds: 0,
      isRunning: false,
      isPaused: false,
      elapsedMinutes: 0,
      elapsedSeconds: 0,
      currentPauseDuration: 0,
      initialTime: { minutes: 5, seconds: 0 },
      name: `Timer ${i + 1}`
    })),
    activeTimerId: 1,
    clockPrettyHeader: 'TIMER OVERVIEW'
  });

  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Calculate and apply dynamic scaling
    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Base dimensions for 1920x1080 design
      const baseWidth = 1920;
      const baseHeight = 1080;
      
      // Calculate scale factors for width and height
      const scaleX = windowWidth / baseWidth;
      const scaleY = windowHeight / baseHeight;
      
      // Use the smaller scale to ensure content fits in both dimensions
      const newScale = Math.min(scaleX, scaleY, 1); // Cap at 1 to prevent upscaling
      
      // Set minimum scale to keep content readable
      const minScale = 0.4;
      setScale(Math.max(newScale, minScale));
    };

    // Calculate initial scale
    calculateScale();

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateScale, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.hostname}:${window.location.port || 8080}/ws`);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'status') {
              setClockData(data);
            }
          } catch (error) {
            console.error('Invalid WebSocket message:', error);
          }
        };

        ws.onerror = () => {
          console.log('WebSocket connection failed, retrying in 5 seconds...');
          setTimeout(connectWebSocket, 5000);
        };

        return ws;
      } catch (error) {
        console.log('WebSocket not available');
        return null;
      }
    };

    const ws = connectWebSocket();
    
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Progress calculation dynamically scales with added time
  const getProgressPercentage = (timer: SingleTimer) => {
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    const elapsedSeconds = timer.elapsedMinutes * 60 + timer.elapsedSeconds;
    const totalTime = remainingSeconds + elapsedSeconds;
    return totalTime > 0 ? Math.min((elapsedSeconds / totalTime) * 100, 100) : 0;
  };

  // Updated progress color to match main display behavior
  const getProgressColor = (timer: SingleTimer) => {
    if (!timer.isRunning) return 'bg-gray-600'; // Gray when not running
    if (timer.isPaused) return 'bg-orange-600'; // Orange when paused
    
    const remaining = timer.minutes * 60 + timer.seconds;
    if (remaining <= 10) return 'bg-red-600'; // Red in last 10 seconds
    if (remaining <= 20) return 'bg-yellow-500'; // Yellow in last 20 seconds
    
    return 'bg-green-600'; // Green when running normally
  };

  const getTimerBackgroundColor = (timer: SingleTimer) => {
    const remaining = timer.minutes * 60 + timer.seconds;
    if (remaining <= 10) {
      return 'bg-red-900/30';
    }
    if (remaining <= 20) {
      return 'bg-yellow-900/30';
    }
    if (timer.isRunning && !timer.isPaused) {
      return 'bg-green-900/30';
    }
    if (timer.isPaused) {
      return 'bg-orange-900/30';
    }
    return 'bg-gray-900/30';
  };

  const getStatusText = (timer: SingleTimer) => {
    if (timer.isPaused) return 'PAUSED';
    if (timer.isRunning) return 'RUNNING';
    return 'STOPPED';
  };

  const getStatusColor = (timer: SingleTimer) => {
    if (timer.isPaused) return 'text-orange-400';
    if (timer.isRunning) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div 
        className="origin-top-left transition-transform duration-300 ease-out"
        style={{ 
          transform: `scale(${scale})`,
          width: '1920px',
          height: '1080px'
        }}
      >
        <div className="max-w-7xl mx-auto p-8 h-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">
              {clockData.clockPrettyHeader || 'TIMER OVERVIEW'}
            </h1>
          </div>

          {/* All Timers - Horizontal Lines */}
          <div className="space-y-4">
            {clockData.timers.map((timer) => {
              const progress = getProgressPercentage(timer);
              const isActive = timer.id === clockData.activeTimerId;
              const backgroundColorClass = getTimerBackgroundColor(timer);
              const elapsedTime = formatTime(timer.elapsedMinutes, timer.elapsedSeconds);
              const remainingTime = formatTime(timer.minutes, timer.seconds);
              
              return (
                <div
                  key={timer.id}
                  className={`${backgroundColorClass} border-2 ${
                    isActive ? 'border-blue-500' : 'border-gray-700'
                  } rounded-xl p-6 transition-all`}
                >
                  <div className="flex items-center gap-8 h-32">
                    {/* Timer ID and Name */}
                    <div className="min-w-[200px] flex flex-col justify-center">
                      <div className={`text-3xl font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                        {timer.name || `Timer ${timer.id}`}
                      </div>
                      <div className={`text-lg font-medium ${getStatusColor(timer)}`}>
                        {getStatusText(timer)}
                      </div>
                    </div>

                    {/* Times - Elapsed and Remaining */}
                    <div className="flex-1 flex justify-center gap-12 items-center h-full">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-2">ELAPSED</div>
                        <div className="text-8xl font-mono text-green-400">+{elapsedTime}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-2">REMAINING</div>
                        <div className="text-8xl font-mono text-red-400">-{remainingTime}</div>
                      </div>
                    </div>

                    {/* Spacer to align progress bar */}
                    <div className="flex-1" />
                  </div>

                  {/* Progress Bar Below - with smooth animation matching main display */}
                  <div className="mt-4">
                    <div className="w-full h-6 bg-gray-700 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-1000 ease-linear ${getProgressColor(timer)}`}
                        style={{ 
                          width: `${progress}%`,
                          transition: timer.isRunning ? 'width 1s linear' : 'width 0.3s ease-out'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockPretty;
