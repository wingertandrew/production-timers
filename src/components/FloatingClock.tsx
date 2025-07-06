
import React from 'react';
import { ClockState, NTPSyncStatus } from '@/types/clock';
import { formatTime } from '@/utils/clockUtils';

interface FloatingClockProps {
  clockState: ClockState;
  ntpSyncStatus: NTPSyncStatus;
}

const FloatingClock: React.FC<FloatingClockProps> = ({ clockState, ntpSyncStatus }) => {
  const activeTimer = clockState.timers.find(t => t.id === clockState.activeTimerId);
  
  if (!activeTimer) {
    return null;
  }

  const getStatusColor = () => {
    if (activeTimer.isPaused) return '#facc15'; // yellow-400
    if (activeTimer.isRunning) return '#22c55e'; // green-500
    if (activeTimer.minutes === 0 && activeTimer.seconds <= 10) return '#ef4444'; // red-500
    return '#6b7280'; // gray-500
  };

  const getStatusText = () => {
    if (activeTimer.isPaused) return 'PAUSED';
    if (activeTimer.isRunning) return 'RUNNING';
    return 'STOPPED';
  };

  const statusColor = getStatusColor();
  const displayTime = formatTime(activeTimer.minutes, activeTimer.seconds);

  return (
    <div className="sticky top-0 z-40 w-full">
      <div 
        className="bg-black border-b-2 px-4 py-2 shadow-lg"
        style={{ borderBottomColor: statusColor }}
      >
        <div className="flex items-center justify-between max-w-full">
          {/* Timer Display */}
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold font-mono text-white">
              {displayTime}
            </div>
            
            {/* Status */}
            <div 
              className="rounded px-3 py-1 text-xs font-bold text-black"
              style={{ backgroundColor: statusColor }}
            >
              {getStatusText()}
            </div>
          </div>

          {/* Timer Info and Details */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-white font-bold">
              TIMER {activeTimer.id}
            </div>
            
            <div className="text-gray-300 text-xs">
              Elapsed: {formatTime(activeTimer.elapsedMinutes, activeTimer.elapsedSeconds)}
            </div>

            {/* NTP Status */}
            {ntpSyncStatus.enabled && (
              <div className="text-xs">
                <span className={ntpSyncStatus.healthy ? 'text-green-400' : 'text-red-400'}>
                  NTP {ntpSyncStatus.healthy ? 'SYNC' : 'FAIL'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingClock;
