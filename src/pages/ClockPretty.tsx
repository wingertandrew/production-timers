
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
  ntpOffset?: number;
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
    ntpOffset: 0,
    clockPrettyHeader: 'TIMER OVERVIEW'
  });

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
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

  const getRemainingPercentage = (timer: SingleTimer) => {
    if (!timer.initialTime) return 0;
    const totalInitialSeconds = timer.initialTime.minutes * 60 + timer.initialTime.seconds;
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    if (totalInitialSeconds === 0) return 0;
    return Math.min((remainingSeconds / totalInitialSeconds) * 100, 100);
  };

  const getProgressColor = (timer: SingleTimer) => {
    const remaining = timer.minutes * 60 + timer.seconds;
    if (timer.isPaused) return 'bg-orange-600';
    if (!timer.isRunning) return 'bg-gray-600';
    if (remaining <= 10) return 'bg-red-600';
    if (remaining <= 20) return 'bg-yellow-500';
    return 'bg-green-600';
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
    <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
      <style>
        {`
          .clock-pretty-container {
            transform: scale(${scale});
            transform-origin: center center;
          }
        `}
      </style>
      
      <div className="clock-pretty-container" style={{ width: '1920px', height: '1080px' }}>
        <div className="max-w-7xl mx-auto p-8 h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-12 flex-shrink-0">
            <h1 className="text-6xl font-bold text-white mb-4">
              {clockData.clockPrettyHeader || 'TIMER OVERVIEW'}
            </h1>
            <div className="text-2xl text-gray-400">
              Active Timer: {clockData.activeTimerId}
            </div>
          </div>

          {/* All Timers - Horizontal Lines */}
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {clockData.timers.map((timer) => {
              const progress = getRemainingPercentage(timer);
              const isActive = timer.id === clockData.activeTimerId;
              const backgroundColorClass = getTimerBackgroundColor(timer);
              const elapsedTime = formatTime(timer.elapsedMinutes, timer.elapsedSeconds);
              const remainingTime = formatTime(timer.minutes, timer.seconds);
              
              return (
                <div
                  key={timer.id}
                  className={`${backgroundColorClass} border-2 ${
                    isActive ? 'border-blue-500' : 'border-gray-700'
                  } rounded-xl p-6 transition-all flex-1 max-h-48`}
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

                    {/* Times - Elapsed and Remaining - 80% of vertical space */}
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

                  {/* Progress Bar Below - with dynamic animation and countdown behavior */}
                  <div className="mt-4">
                    <div className="w-full h-6 bg-gray-700 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${getProgressColor(timer)}`}
                        style={{ 
                          width: `${progress}%`,
                          transitionDuration: timer.isRunning && !timer.isPaused ? '1000ms' : '300ms',
                          transitionTimingFunction: timer.isRunning && !timer.isPaused ? 'linear' : 'ease-out'
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
