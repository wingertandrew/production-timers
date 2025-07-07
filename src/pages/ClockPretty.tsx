
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

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
  initialTime?: { minutes: number; seconds: number };
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
      currentPauseDuration: 0,
      initialTime: { minutes: 5, seconds: 0 }
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

  const getProgressPercentage = (timer: SingleTimer) => {
    if (!timer.initialTime) return 0;
    const totalInitialSeconds = timer.initialTime.minutes * 60 + timer.initialTime.seconds;
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    const elapsedSeconds = totalInitialSeconds - remainingSeconds;
    return totalInitialSeconds > 0 ? (elapsedSeconds / totalInitialSeconds) * 100 : 0;
  };

  const getColorInfo = (timer: SingleTimer) => {
    const remaining = timer.minutes * 60 + timer.seconds;
    if (remaining <= 10) {
      return { class: 'text-red-400', pulse: true };
    }
    if (remaining <= 20) {
      return { class: 'text-yellow-400', pulse: false };
    }
    if (timer.isRunning && !timer.isPaused) {
      return { class: 'text-green-400', pulse: false };
    }
    return { class: 'text-gray-400', pulse: false };
  };

  const getStatusText = (timer: SingleTimer) => {
    if (timer.isPaused) return 'PAUSED';
    if (timer.isRunning) return 'RUNNING';
    return 'STOPPED';
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">TIMER OVERVIEW</h1>
          <div className="text-2xl text-gray-400">
            Active Timer: {clockData.activeTimerId}
          </div>
        </div>

        {/* All Timers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {clockData.timers.map((timer) => {
            const progress = getProgressPercentage(timer);
            const isActive = timer.id === clockData.activeTimerId;
            const colorInfo = getColorInfo(timer);
            
            return (
              <div
                key={timer.id}
                className={`bg-gray-900 rounded-2xl p-8 border-2 transition-all ${
                  isActive ? 'border-blue-500 bg-gray-800 scale-105' : 'border-gray-700'
                }`}
              >
                {/* Timer Header */}
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold mb-2 ${isActive ? 'text-blue-400' : 'text-white'}`}>
                    TIMER {timer.id}
                  </div>
                  <div className={`text-2xl font-bold ${colorInfo.class}`}>
                    {getStatusText(timer)}
                  </div>
                </div>

                {/* Main Time Display */}
                <div className="text-center mb-6">
                  <div
                    className={`text-8xl font-mono font-bold mb-4 ${colorInfo.class} ${colorInfo.pulse ? 'urgent-pulse' : ''}`}
                  >
                    {formatTime(timer.minutes, timer.seconds)}
                  </div>
                  
                  {/* Elapsed Time */}
                  <div className="text-2xl font-mono text-green-400">
                    Elapsed: {formatTime(timer.elapsedMinutes, timer.elapsedSeconds)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <Progress 
                    value={progress} 
                    className="h-4 bg-gray-700"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>{progress.toFixed(1)}%</span>
                    <span>Complete</span>
                  </div>
                </div>

                {/* Additional Info */}
                {(timer.isPaused || timer.totalPausedTime > 0) && (
                  <div className="text-center space-y-2">
                    {timer.isPaused && (
                      <div className="text-yellow-400 text-lg animate-pulse">
                        Current Pause: {formatDuration(timer.currentPauseDuration)}
                      </div>
                    )}
                    {timer.totalPausedTime > 0 && (
                      <div className="text-yellow-300 text-sm">
                        Total Paused: {formatDuration(timer.totalPausedTime)}
                      </div>
                    )}
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
