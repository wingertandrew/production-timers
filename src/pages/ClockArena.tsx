
import React, { useState, useEffect } from 'react';

interface SingleTimer {
  id: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface ClockData {
  timers: SingleTimer[];
  activeTimerId: number | null;
  ntpOffset?: number;
}

const ClockArena = () => {
  const [clockData, setClockData] = useState<ClockData>({
    timers: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      minutes: 5,
      seconds: 0,
      isRunning: false,
      isPaused: false
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

  const activeTimer = clockData.timers.find(t => t.id === clockData.activeTimerId);
  if (!activeTimer) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  const getTimerColor = () => {
    if (activeTimer.isPaused) return 'text-yellow-400';
    if (activeTimer.isRunning) return 'text-green-400';
    if (activeTimer.minutes === 0 && activeTimer.seconds <= 10) return 'text-red-400 animate-pulse';
    return 'text-white';
  };

  const getTimerIdColor = () => {
    return activeTimer.isRunning ? 'text-blue-400' : 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Left Corner - Main Timer */}
      <div className="absolute top-8 left-8">
        <div className={`text-8xl font-mono font-bold tracking-wider mb-2 ${getTimerColor()}`}>
          {formatTime(activeTimer.minutes, activeTimer.seconds)}
        </div>
        
        {/* Timer ID Indicator */}
        <div className={`text-2xl font-bold ${getTimerIdColor()}`}>
          TIMER {activeTimer.id}
        </div>
        
        {/* Status Indicator */}
        {activeTimer.isPaused && (
          <div className="text-xl text-yellow-400 animate-pulse mt-1">
            ⏸️ PAUSED
          </div>
        )}
        
        {!activeTimer.isRunning && !activeTimer.isPaused && (
          <div className="text-xl text-red-400 mt-1">
            ⏹️ STOPPED
          </div>
        )}
        
        {activeTimer.isRunning && !activeTimer.isPaused && (
          <div className="text-xl text-green-400 mt-1">
            ▶️ RUNNING
          </div>
        )}
      </div>

      {/* Background Arena Graphics */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-blue-500"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-blue-500"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-blue-500"></div>
      </div>

      {/* Center Logo/Text Area (Available for customization) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl font-bold text-gray-800 opacity-20">
          MULTI-TIMER
        </div>
      </div>

      {/* Bottom Right - Timer Status Grid */}
      <div className="absolute bottom-8 right-8">
        <div className="grid grid-cols-5 gap-2">
          {clockData.timers.map((timer) => (
            <div
              key={timer.id}
              className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold ${
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
    </div>
  );
};

export default ClockArena;
