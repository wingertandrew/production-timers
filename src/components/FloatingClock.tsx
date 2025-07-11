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
}

const FloatingClock: React.FC = () => {
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
    activeTimerId: 1
  });

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}`);

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

  const getProgressPercentage = (timer: SingleTimer) => {
    if (!timer.initialTime) return 0;
    const totalInitialSeconds = timer.initialTime.minutes * 60 + timer.initialTime.seconds;
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    const elapsedSeconds = totalInitialSeconds - remainingSeconds;
    return totalInitialSeconds > 0 ? (elapsedSeconds / totalInitialSeconds) * 100 : 0;
  };

  const getTimerColor = (timer: SingleTimer) => {
    const remaining = timer.minutes * 60 + timer.seconds;
    if (remaining <= 10) return 'text-red-400';
    if (remaining <= 20) return 'text-yellow-400';
    if (timer.isRunning && !timer.isPaused) return 'text-green-400';
    return 'text-gray-400';
  };

  const getStatusColor = (timer: SingleTimer) => {
    if (timer.isPaused) return 'text-orange-400';
    if (timer.isRunning) return 'text-green-400';
    return 'text-gray-400';
  };

  const getStatusText = (timer: SingleTimer) => {
    if (timer.isPaused) return 'PAUSED';
    if (timer.isRunning) return 'RUNNING';
    return 'STOPPED';
  };

  return (
    <div className="bg-black border-b border-gray-700 py-3 px-6">
      <div className="flex items-center justify-between space-x-8">
        {clockData.timers.map((timer) => {
          const isActive = timer.id === clockData.activeTimerId;
          const progress = getProgressPercentage(timer);
          const timerColor = getTimerColor(timer);
          const statusColor = getStatusColor(timer);
          
          return (
            <div
              key={timer.id}
              className={`flex flex-col items-center space-y-1 ${
                isActive ? 'border-b-2 border-blue-500 pb-2' : ''
              }`}
            >
              <div className={`text-lg font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                {timer.name || `Timer ${timer.id}`}
              </div>
              <div className={`text-2xl font-mono font-bold ${timerColor}`}>
                {formatTime(timer.minutes, timer.seconds)}
              </div>
              <div className={`text-xs font-medium ${statusColor}`}>
                {getStatusText(timer)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingClock;
