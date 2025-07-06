
import React from 'react';
import { ClockState, NTPSyncStatus } from '@/types/clock';
import { formatTime } from '@/utils/clockUtils';

interface FloatingClockProps {
  clockState: ClockState;
  ntpSyncStatus: NTPSyncStatus;
}

const FloatingClock: React.FC<FloatingClockProps> = ({ clockState, ntpSyncStatus }) => {
  const getStatusColor = (timer: any) => {
    if (timer.isPaused) return '#facc15'; // yellow-400
    if (timer.isRunning) return '#22c55e'; // green-500
    if (timer.minutes === 0 && timer.seconds <= 10) return '#ef4444'; // red-500
    return '#6b7280'; // gray-500
  };

  const getStatusText = (timer: any) => {
    if (timer.isPaused) return 'P';
    if (timer.isRunning) return 'R';
    return 'S';
  };

  return (
    <div className="sticky top-0 z-40 w-full">
      <div className="bg-black border-b-2 border-gray-600 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between max-w-full">
          {/* All 5 Timers Display */}
          <div className="flex items-center space-x-6 flex-1">
            {clockState.timers.map((timer) => {
              const statusColor = getStatusColor(timer);
              const displayTime = formatTime(timer.minutes, timer.seconds);
              const isActive = timer.id === clockState.activeTimerId;
              
              return (
                <div key={timer.id} className="flex items-center space-x-2">
                  {/* Timer Number */}
                  <div className={`text-lg font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                    {timer.id}
                  </div>
                  
                  {/* Timer Time */}
                  <div className={`text-xl font-mono font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                    {displayTime}
                  </div>
                  
                  {/* Status */}
                  <div 
                    className="rounded px-2 py-1 text-xs font-bold text-black"
                    style={{ backgroundColor: statusColor }}
                  >
                    {getStatusText(timer)}
                  </div>
                  
                  {/* Elapsed Time (only for active timer) */}
                  {isActive && (
                    <div className="text-gray-300 text-sm">
                      Elapsed: {formatTime(timer.elapsedMinutes, timer.elapsedSeconds)}
                    </div>
                  )}
                </div>
              );
            })}
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
  );
};

export default FloatingClock;
