
import React, { useState, useEffect } from 'react';

interface SingleTimer {
  id: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  elapsedMinutes: number;
  elapsedSeconds: number;
  totalPausedTime: number;
  currentPauseDuration: number;
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
      totalPausedTime: 0,
      currentPauseDuration: 0
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

  const activeTimer = clockData.timers.find(t => t.id === clockData.activeTimerId);
  if (!activeTimer) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  const getStatusColor = () => {
    if (activeTimer.isPaused) return 'text-yellow-400';
    if (activeTimer.isRunning) return 'text-green-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (activeTimer.isPaused) return 'PAUSED';
    if (activeTimer.isRunning) return 'RUNNING';
    return 'STOPPED';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      {/* Main Timer Display */}
      <div className="text-center mb-8">
        <div className="text-[20rem] font-mono font-bold tracking-wider mb-8 text-white leading-none">
          {formatTime(activeTimer.minutes, activeTimer.seconds)}
        </div>
        
        {/* Status Indicator */}
        <div className={`text-6xl font-bold mb-6 ${getStatusColor()}`}>
          {getStatusText()}
          {activeTimer.isPaused && (
            <div className="text-4xl animate-pulse mt-2">
              {formatDuration(activeTimer.currentPauseDuration)}
            </div>
          )}
        </div>
      </div>

      {/* Timer Information */}
      <div className="text-center mb-8">
        <div className="text-8xl font-bold text-blue-400 mb-4">
          TIMER {activeTimer.id}
        </div>
        
        {/* All Timers Status */}
        <div className="flex justify-center space-x-4 mb-6">
          {clockData.timers.map((timer) => (
            <div
              key={timer.id}
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg ${
                timer.id === clockData.activeTimerId
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : timer.isRunning
                  ? 'bg-green-500 border-green-500 text-white'
                  : timer.isPaused
                  ? 'bg-yellow-500 border-yellow-500 text-black'
                  : 'border-gray-600 text-gray-400'
              }`}
            >
              {timer.id}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-16 text-center">
        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-700">
          <div className="text-2xl text-gray-400 mb-2">TIME ELAPSED</div>
          <div className="text-5xl font-mono font-bold text-green-400">
            {formatTime(activeTimer.elapsedMinutes, activeTimer.elapsedSeconds)}
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-700">
          <div className="text-2xl text-gray-400 mb-2">TOTAL PAUSED</div>
          <div className="text-5xl font-mono font-bold text-yellow-400">
            {formatDuration(activeTimer.totalPausedTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockPretty;
