
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Plus, Minus, Wifi, WifiOff } from 'lucide-react';
import HoldButton from './HoldButton';
import FastAdjustButton from './FastAdjustButton';
import { ClockState, NTPSyncStatus } from '@/types/clock';
import { formatTime, formatDuration } from '@/utils/clockUtils';

interface ClockDisplayProps {
  clockState: ClockState;
  ipAddress: string;
  ntpSyncStatus: NTPSyncStatus;
  onTogglePlayPause: () => void;
  onResetTime: () => void;
  onAdjustTimeBySeconds: (seconds: number) => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({
  clockState,
  ipAddress,
  ntpSyncStatus,
  onTogglePlayPause,
  onResetTime,
  onAdjustTimeBySeconds
}) => {
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
    if (timer.isPaused) return 'PAUSED';
    if (timer.isRunning) return 'RUNNING';
    return 'STOPPED';
  };

  const getProgressPercentage = (timer: any) => {
    const totalInitialSeconds = timer.initialTime.minutes * 60 + timer.initialTime.seconds;
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    const elapsedSeconds = totalInitialSeconds - remainingSeconds;
    return totalInitialSeconds > 0 ? (elapsedSeconds / totalInitialSeconds) * 100 : 0;
  };

  const activeTimer = clockState.timers.find(t => t.id === clockState.activeTimerId);

  return (
    <div className="min-h-screen bg-black text-white p-4 overflow-hidden">
      <div className="h-screen flex flex-col max-w-[1920px] mx-auto">
        {/* Header with IP and NTP Status */}
        <div className="flex justify-between items-center mb-4 h-12">
          <div className="flex items-center gap-2 text-white text-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span>{ipAddress}</span>
          </div>
          
          {ntpSyncStatus.enabled && (
            <div className="flex items-center gap-2 text-lg">
              {ntpSyncStatus.healthy ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className={ntpSyncStatus.healthy ? 'text-green-400' : 'text-red-400'}>
                NTP {ntpSyncStatus.healthy ? 'SYNC' : 'FAIL'}
              </span>
              {ntpSyncStatus.timeOffset !== 0 && (
                <span className="text-yellow-400 text-sm">
                  {ntpSyncStatus.timeOffset > 0 ? '+' : ''}{ntpSyncStatus.timeOffset}ms
                </span>
              )}
            </div>
          )}
        </div>

        {/* All Timers Vertical Stack - Responsive Text */}
        <div className="flex-1 flex flex-col justify-center gap-2 mb-8">
          {clockState.timers.map((timer) => {
            const progress = getProgressPercentage(timer);
            const isActive = timer.id === clockState.activeTimerId;
            const colorInfo = getColorInfo(timer);
            const displayTime = formatTime(timer.minutes, timer.seconds);
            const elapsedTime = formatTime(
              timer.elapsedMinutes,
              timer.elapsedSeconds
            );
            
            return (
              <div
                key={timer.id}
                className={`bg-gray-900 rounded-xl p-4 border-2 transition-all ${
                  isActive ? 'border-blue-500 bg-gray-800' : 'border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Timer ID - Small single number */}
                  <div className={`text-3xl font-bold ${isActive ? 'text-blue-400' : 'text-white'} min-w-[60px]`}>
                    {timer.id}
                  </div>
                  
                  {/* Timer Display with Elapsed/Remaining */}
                  <div className="flex-1 text-center">
                    <div
                      className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-mono font-bold tracking-wider ${colorInfo.text} ${colorInfo.pulse ? 'urgent-pulse' : ''}`}
                    >
                      {displayTime}
                    </div>
                    <div className="flex justify-center gap-6 mt-2 text-lg md:text-xl lg:text-2xl font-mono">
                      <span className="text-green-400">+{elapsedTime}</span>
                      <span className="text-red-400">-{displayTime}</span>
                    </div>
                  </div>
                  
                  {/* Status - Smaller */}
                  <div
                    className={`rounded-lg p-2 min-w-[120px] ${
                      timer.isRunning && !timer.isPaused && colorInfo.pulse
                        ? 'urgent-pulse'
                        : ''
                    }`}
                    style={{ backgroundColor: colorInfo.hex }}
                  >
                    <div className="flex items-center gap-2 text-black text-sm font-bold justify-center">
                      {timer.isRunning && !timer.isPaused ? (
                        <div className="w-0 h-0 border-l-[8px] border-l-black border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                      ) : timer.isPaused ? (
                        <div className="flex gap-1">
                          <div className="w-1.5 h-3 bg-black"></div>
                          <div className="w-1.5 h-3 bg-black"></div>
                        </div>
                      ) : (
                        <div className="w-3 h-3 bg-black"></div>
                      )}
                      <span>{getStatusText(timer)}</span>
                      {timer.isPaused && (
                        <div className="bg-black/20 rounded-full px-1.5 py-0.5 text-xs font-mono ml-1">
                          {formatDuration(timer.currentPauseDuration)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <Progress 
                    value={progress} 
                    className="h-3 bg-gray-700"
                  />
                  {timer.totalPausedTime > 0 && (
                    <div className="text-center text-yellow-400 text-sm mt-2">
                      Total Paused: {formatDuration(timer.totalPausedTime)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Control Buttons - Only for Active Timer */}
        {activeTimer && (
          <div className="flex justify-center gap-4 mb-4">
            {/* Time Adjustment */}
            <FastAdjustButton
              onAdjust={(amount) => onAdjustTimeBySeconds(amount)}
              adjustAmount={-1}
              disabled={activeTimer.isRunning && !activeTimer.isPaused}
              className="h-16 w-16 bg-gray-400 hover:bg-gray-300 text-black rounded-xl text-2xl font-bold"
            >
              <Minus className="w-8 h-8" />
            </FastAdjustButton>

            <FastAdjustButton
              onAdjust={(amount) => onAdjustTimeBySeconds(amount)}
              adjustAmount={1}
              disabled={activeTimer.isRunning && !activeTimer.isPaused}
              className="h-16 w-16 bg-gray-400 hover:bg-gray-300 text-black rounded-xl text-2xl font-bold"
            >
              <Plus className="w-8 h-8" />
            </FastAdjustButton>

            {/* Play/Pause Button */}
            <Button
              onClick={onTogglePlayPause}
              className="h-16 w-32 bg-gray-400 hover:bg-gray-300 text-black rounded-xl"
            >
              {activeTimer.isRunning && !activeTimer.isPaused ? (
                <div className="flex gap-2">
                  <div className="w-3 h-10 bg-black"></div>
                  <div className="w-3 h-10 bg-black"></div>
                </div>
              ) : (
                <div className="w-0 h-0 border-l-[20px] border-l-black border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2"></div>
              )}
            </Button>

            {/* Reset Button */}
            <HoldButton
              onHoldComplete={onResetTime}
              className="h-16 w-16 bg-gray-400 hover:bg-gray-300 text-black rounded-xl"
            >
              <RotateCcw className="w-8 h-8" />
            </HoldButton>
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex justify-between items-center text-white text-lg h-8">
          <div className="flex gap-6">
            {activeTimer && (
              <>
                <div>
                  Active: Timer {activeTimer.id}
                </div>
                <div>
                  Elapsed: {formatTime(activeTimer.elapsedMinutes, activeTimer.elapsedSeconds)}
                </div>
                {activeTimer.totalPausedTime > 0 && (
                  <div className="text-yellow-400">
                    Total Paused: {formatDuration(activeTimer.totalPausedTime)}
                  </div>
                )}
              </>
            )}
          </div>
          
          {ntpSyncStatus.enabled && ntpSyncStatus.syncCount > 0 && (
            <div className="text-blue-400">
              NTP Syncs: {ntpSyncStatus.syncCount} | Errors: {ntpSyncStatus.errorCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClockDisplay;
