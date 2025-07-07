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
    ntpOffset: 0
  });

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

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getElapsedPercentage = (timer: SingleTimer) => {
    if (!timer.initialTime) return 0;
    const totalInitialSeconds = timer.initialTime.minutes * 60 + timer.initialTime.seconds;
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    return totalInitialSeconds > 0
      ? ((totalInitialSeconds - remainingSeconds) / totalInitialSeconds) * 100
      : 0;
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">TIMER OVERVIEW</h1>
          <div className="text-2xl text-gray-400">
            Active Timer: {clockData.activeTimerId}
          </div>
        </div>

        {/* All Timers - Horizontal Lines */}
        <div className="space-y-4">
          {clockData.timers.map((timer) => {
            const progress = getElapsedPercentage(timer);
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
                <div className="flex items-center gap-8">
                  {/* Timer ID and Name */}
                  <div className="min-w-[200px]">
                    <div className={`text-3xl font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                      {timer.name || `Timer ${timer.id}`}
                    </div>
                    <div className={`text-lg font-medium ${getStatusColor(timer)}`}>
                      {getStatusText(timer)}
                    </div>
                  </div>

                  {/* Times - Elapsed and Remaining */}
                  <div className="flex-1 flex justify-center gap-12 text-4xl font-mono">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">ELAPSED</div>
                      <div className="text-green-400">+{elapsedTime}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">REMAINING</div>
                      <div className="text-red-400">-{remainingTime}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="w-full h-6 bg-gray-700 rounded">
                      <div
                        className={`h-full rounded ${getProgressColor(timer)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info - Pause Times */}
                {timer.isPaused && (
                  <div className="mt-4 text-center space-y-1">
                    <div className="text-yellow-400 text-lg animate-pulse">
                      Current Pause: {formatDuration(timer.currentPauseDuration)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
            <div className="text-xl text-gray-400 mb-2">RUNNING TIMERS</div>
            <div className="text-4xl font-bold text-green-400">
              {clockData.timers.filter(t => t.isRunning && !t.isPaused).length}
            </div>
          </div>
          
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
            <div className="text-xl text-gray-400 mb-2">PAUSED TIMERS</div>
            <div className="text-4xl font-bold text-yellow-400">
              {clockData.timers.filter(t => t.isPaused).length}
            </div>
          </div>
          
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
            <div className="text-xl text-gray-400 mb-2">STOPPED TIMERS</div>
            <div className="text-4xl font-bold text-gray-400">
              {clockData.timers.filter(t => !t.isRunning && !t.isPaused).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockPretty;
