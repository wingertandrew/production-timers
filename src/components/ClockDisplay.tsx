
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Plus, Minus, RotateCcw, History, Wifi, WifiOff } from 'lucide-react';
import HoldButton from './HoldButton';
import FastAdjustButton from './FastAdjustButton';
import { ClockState, NTPSyncStatus } from '@/types/clock';
import { formatTime, formatDuration } from '@/utils/clockUtils';

interface ClockDisplayProps {
  clockState: ClockState;
  ipAddress: string;
  betweenRoundsEnabled: boolean;
  betweenRoundsTime: number;
  ntpSyncStatus: NTPSyncStatus;
  onTogglePlayPause: () => void;
  onNextRound: () => void;
  onPreviousRound: () => void;
  onResetTime: () => void;
  onResetRounds: () => void;
  onAdjustTimeBySeconds: (seconds: number) => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({
  clockState,
  ipAddress,
  betweenRoundsEnabled,
  betweenRoundsTime,
  ntpSyncStatus,
  onTogglePlayPause,
  onNextRound,
  onPreviousRound,
  onResetTime,
  onResetRounds,
  onAdjustTimeBySeconds
}) => {
  const activeTimer = clockState.timers.find(t => t.id === clockState.activeTimerId);
  
  if (!activeTimer) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">No active timer</div>;
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
    <div className="min-h-screen bg-black text-white p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 sm:border-4 relative overflow-hidden max-w-7xl mx-auto"
        style={{ borderColor: statusColor }}
      >
        {/* Elapsed Time Header */}
        <div
          className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4"
          style={{ backgroundColor: statusColor }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 text-black text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">
            <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-black flex items-center justify-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: statusColor }}></div>
            </div>
            <span>
              ELAPSED: {formatTime(activeTimer.elapsedMinutes, activeTimer.elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Main Timer Display - Responsive sizing */}
        <div className="mt-12 sm:mt-16 md:mt-20 mb-4 sm:mb-6 md:mb-8">
          <div className="text-center">
            <div className="text-6xl sm:text-8xl md:text-[12rem] lg:text-[16rem] xl:text-[20rem] 2xl:text-[24rem] font-bold tracking-wider text-white leading-none font-mono">
              {displayTime}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div 
          className={`rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 ${
            activeTimer.isRunning && 
            !activeTimer.isPaused && 
            activeTimer.minutes === 0 && 
            activeTimer.seconds <= 10 
              ? 'urgent-pulse' 
              : ''
          }`} 
          style={{ backgroundColor: statusColor }}
        >
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-black">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                <div className="flex items-center gap-2 sm:gap-3">
                  {activeTimer.isRunning && !activeTimer.isPaused ? (
                    <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] md:border-l-[20px] border-l-black border-t-[8px] sm:border-t-[10px] md:border-t-[12px] border-t-transparent border-b-[8px] sm:border-b-[10px] md:border-b-[12px] border-b-transparent"></div>
                  ) : activeTimer.isPaused ? (
                    <div className="flex gap-1 sm:gap-2">
                      <div className="w-2 sm:w-3 h-4 sm:h-6 md:h-8 bg-black"></div>
                      <div className="w-2 sm:w-3 h-4 sm:h-6 md:h-8 bg-black"></div>
                    </div>
                  ) : (
                    <div className="w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8 bg-black"></div>
                  )}
                  <span>{getStatusText()}</span>
                </div>
              </div>
              {activeTimer.isPaused && (
                <div className="bg-black/20 rounded-full px-3 py-1 text-sm sm:text-base md:text-lg font-mono">
                  {formatDuration(activeTimer.currentPauseDuration)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IP Address and NTP Status */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-sm sm:text-lg md:text-xl">
              <div className="w-2 sm:w-3 md:w-4 h-2 sm:h-3 md:h-4 bg-white rounded-full"></div>
              <span>{ipAddress}</span>
            </div>
            
            {ntpSyncStatus.enabled && (
              <div className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                {ntpSyncStatus.healthy ? (
                  <Wifi className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-green-400" />
                ) : (
                  <WifiOff className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-red-400" />
                )}
                <span className={ntpSyncStatus.healthy ? 'text-green-400' : 'text-red-400'}>
                  NTP {ntpSyncStatus.healthy ? 'SYNC' : 'FAIL'}
                </span>
                {ntpSyncStatus.timeOffset !== 0 && (
                  <span className="text-yellow-400 text-xs sm:text-sm">
                    {ntpSyncStatus.timeOffset > 0 ? '+' : ''}{ntpSyncStatus.timeOffset}ms
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timer Info */}
        <div className="text-center text-white mb-4 sm:mb-6 md:mb-8">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
            TIMER {activeTimer.id}
          </div>
        </div>

        {/* Control Buttons - Responsive grid */}
        <div className="grid grid-cols-8 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          {/* Time Adjustment Group */}
          <div className="col-span-2 flex gap-1 sm:gap-2">
            <FastAdjustButton
              onAdjust={(amount) => onAdjustTimeBySeconds(amount)}
              adjustAmount={-1}
              disabled={activeTimer.isRunning && !activeTimer.isPaused}
              className="h-12 sm:h-16 md:h-20 lg:h-24 bg-gray-400 hover:bg-gray-300 text-black rounded-xl sm:rounded-2xl text-lg sm:text-2xl md:text-3xl font-bold flex-1"
            >
              <Minus className="w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8" />
            </FastAdjustButton>
            <FastAdjustButton
              onAdjust={(amount) => onAdjustTimeBySeconds(amount)}
              adjustAmount={1}
              disabled={activeTimer.isRunning && !activeTimer.isPaused}
              className="h-12 sm:h-16 md:h-20 lg:h-24 bg-gray-400 hover:bg-gray-300 text-black rounded-xl sm:rounded-2xl text-lg sm:text-2xl md:text-3xl font-bold flex-1"
            >
              <Plus className="w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8" />
            </FastAdjustButton>
          </div>

          {/* Placeholder buttons for layout */}
          <Button
            disabled
            className="h-12 sm:h-16 md:h-20 lg:h-24 bg-gray-600 text-gray-400 rounded-xl sm:rounded-2xl opacity-50 cursor-not-allowed"
          >
            <SkipBack className="w-5 sm:w-7 md:w-9 lg:w-10 h-5 sm:h-7 md:h-9 lg:h-10" />
          </Button>

          {/* Play/Pause Button - Wider */}
          <Button
            onClick={onTogglePlayPause}
            className="h-12 sm:h-16 md:h-20 lg:h-24 bg-gray-400 hover:bg-gray-300 text-black rounded-xl sm:rounded-2xl col-span-2"
          >
            {activeTimer.isRunning && !activeTimer.isPaused ? (
              <div className="flex gap-1 sm:gap-2">
                <div className="w-2 sm:w-3 md:w-4 h-6 sm:h-8 md:h-10 lg:h-12 bg-black"></div>
                <div className="w-2 sm:w-3 md:w-4 h-6 sm:h-8 md:h-10 lg:h-12 bg-black"></div>
              </div>
            ) : (
              <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] md:border-l-[20px] lg:border-l-[24px] border-l-black border-t-[9px] sm:border-t-[12px] md:border-t-[15px] lg:border-t-[18px] border-t-transparent border-b-[9px] sm:border-b-[12px] md:border-b-[15px] lg:border-b-[18px] border-b-transparent ml-1 sm:ml-2"></div>
            )}
          </Button>

          <Button
            disabled
            className="h-12 sm:h-16 md:h-20 lg:h-24 bg-gray-600 text-gray-400 rounded-xl sm:rounded-2xl opacity-50 cursor-not-allowed"
          >
            <SkipForward className="w-5 sm:w-7 md:w-9 lg:w-10 h-5 sm:h-7 md:h-9 lg:h-10" />
          </Button>

          {/* Reset Time Button */}
          <HoldButton
            onHoldComplete={onResetTime}
            className="h-12 sm:h-16 md:h-20 lg:h-24 bg-gray-400 hover:bg-gray-300 text-black rounded-xl sm:rounded-2xl"
          >
            <RotateCcw className="w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8" />
          </HoldButton>

          {/* Reset Rounds Button - Disabled for discrete timers */}
          <HoldButton
            onHoldComplete={onResetRounds}
            disabled
            className="h-12 sm:h-16 md:h-20 lg:h-24 bg-gray-600 text-gray-400 rounded-xl sm:rounded-2xl opacity-50 cursor-not-allowed"
          >
            <History className="w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8" />
          </HoldButton>
        </div>

        {/* Stats */}
        <div className="flex items-start text-white">
          {/* Left side - Total Paused info */}
          <div className="flex flex-col gap-1">
            {activeTimer.totalPausedTime > 0 && (
              <div className="text-yellow-400 text-lg sm:text-xl md:text-2xl">
                Total Paused: {formatDuration(activeTimer.totalPausedTime)}
              </div>
            )}
            {ntpSyncStatus.enabled && ntpSyncStatus.syncCount > 0 && (
              <div className="text-blue-400 text-lg sm:text-xl md:text-2xl">
                NTP Syncs: {ntpSyncStatus.syncCount} | Errors: {ntpSyncStatus.errorCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockDisplay;
