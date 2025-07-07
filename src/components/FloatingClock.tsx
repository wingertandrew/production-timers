
import React from 'react';
import { ClockState, NTPSyncStatus } from '@/types/clock';
import { formatTime } from '@/utils/clockUtils';

interface FloatingClockProps {
  clockState: ClockState;
  ntpSyncStatus: NTPSyncStatus;
}

const FloatingClock: React.FC<FloatingClockProps> = ({ clockState, ntpSyncStatus }) => {
  const getColorInfo = (timer: any) => {
    const remaining = timer.minutes * 60 + timer.seconds;
    if (remaining <= 10) {
      return { hex: '#ef4444', text: 'text-red-400', pulse: true };
    }
    if (remaining <= 20) {
      return { hex: '#facc15', text: 'text-yellow-400', pulse: false };
    }
    if (timer.isRunning && !timer.isPaused) {
      return { hex: '#22c55e', text: 'text-green-400', pulse: false };
    }
    return { hex: '#6b7280', text: 'text-gray-400', pulse: false };
  };

  const getStatusText = (timer: any) => {
    if (timer.isPaused) return 'P';
    if (timer.isRunning) return 'R';
    return 'S';
  };

  return (
    <div className="w-full bg-black border-b-2 border-gray-600 shadow-lg z-40">
      <div className="flex flex-col w-full">
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
            const colorInfo = getColorInfo(timer);
            const displayTime = formatTime(timer.minutes, timer.seconds);
            const elapsedTime = formatTime(
              timer.elapsedMinutes,
              timer.elapsedSeconds
            );
            const progress = timer.initialTime
              ?
                  ((
                    timer.initialTime.minutes * 60 +
                      timer.initialTime.seconds -
                      (timer.minutes * 60 + timer.seconds)
                  ) /
                    (timer.initialTime.minutes * 60 +
                      timer.initialTime.seconds)) * 100
              : 0;
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
                  <div className={`text-lg font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>{timer.id}</div>

                  {/* Timer Time */}
                  <div
                    className={`text-lg font-mono font-bold ${colorInfo.text} ${colorInfo.pulse ? 'urgent-pulse' : ''}`}
                  >
                    {displayTime}
                  </div>

                  {/* Status */}
                  <div
                    className="rounded px-2 py-1 text-xs font-bold text-black min-w-[24px] text-center"
                    style={{ backgroundColor: colorInfo.hex }}
                  >
                    {getStatusText(timer)}
                  </div>
                </div>

                {/* Elapsed & Progress */}
                <div className="flex items-center gap-2 mt-1">
                  <div className={`text-xs font-mono w-1/2 ${colorInfo.text}`}>{elapsedTime}</div>
                  <div className="w-1/2 h-2 bg-gray-700 rounded">
                    <div
                      className="h-full rounded"
                      style={{ width: `${progress}%`, backgroundColor: colorInfo.hex }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloatingClock;
