
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
    <div className="fixed top-0 right-0 z-50 bg-black border-l-2 border-gray-600 shadow-lg">
      <div className="flex flex-col w-64">
        {/* Header */}
        <div className="bg-gray-800 px-3 py-2 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-bold">All Timers</span>
            {ntpSyncStatus.enabled && (
              <span className={`text-xs ${ntpSyncStatus.healthy ? 'text-green-400' : 'text-red-400'}`}>
                NTP {ntpSyncStatus.healthy ? 'SYNC' : 'FAIL'}
              </span>
            )}
          </div>
        </div>

        {/* Stacked Timers */}
        <div className="flex flex-col">
          {clockState.timers.map((timer) => {
            const statusColor = getStatusColor(timer);
            const displayTime = formatTime(timer.minutes, timer.seconds);
            const isActive = timer.id === clockState.activeTimerId;
            
            return (
              <div 
                key={timer.id} 
                className={`px-3 py-2 border-b border-gray-700 ${
                  isActive ? 'bg-blue-900/30 border-blue-500/50' : 'bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Timer ID */}
                  <div className={`text-lg font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                    {timer.id}
                  </div>
                  
                  {/* Timer Time */}
                  <div className={`text-lg font-mono font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                    {displayTime}
                  </div>
                  
                  {/* Status */}
                  <div 
                    className="rounded px-2 py-1 text-xs font-bold text-black min-w-[24px] text-center"
                    style={{ backgroundColor: statusColor }}
                  >
                    {getStatusText(timer)}
                  </div>
                </div>
                
                {/* Elapsed Time for Active Timer */}
                {isActive && (
                  <div className="text-gray-400 text-xs mt-1">
                    Elapsed: {formatTime(timer.elapsedMinutes, timer.elapsedSeconds)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloatingClock;
