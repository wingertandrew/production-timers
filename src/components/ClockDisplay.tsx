
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

  const getProgressPercentage = (timer: any) => {
    const totalInitialSeconds = timer.initialTime.minutes * 60 + timer.initialTime.seconds;
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    const elapsedSeconds = totalInitialSeconds - remainingSeconds;
    return totalInitialSeconds > 0 ? (elapsedSeconds / totalInitialSeconds) * 100 : 0;
  };

  const statusColor = getStatusColor();
  const displayTime = formatTime(activeTimer.minutes, activeTimer.seconds);

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

        {/* Main Active Timer Display */}
        <div className="flex-1 flex flex-col justify-center items-center mb-8">
          <div className="text-center mb-6">
            <div className="text-[12rem] font-mono font-bold tracking-wider text-white leading-none mb-4">
              {displayTime}
            </div>
            
            {/* Status Bar */}
            <div 
              className={`rounded-2xl p-6 mb-6 ${
                activeTimer.isRunning && 
                !activeTimer.isPaused && 
                activeTimer.minutes === 0 && 
                activeTimer.seconds <= 10 
                  ? 'urgent-pulse' 
                  : ''
              }`} 
              style={{ backgroundColor: statusColor }}
            >
              <div className="flex items-center justify-center gap-4 text-black">
                <div className="flex items-center gap-3 text-4xl font-bold">
                  {activeTimer.isRunning && !activeTimer.isPaused ? (
                    <div className="w-0 h-0 border-l-[20px] border-l-black border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"></div>
                  ) : activeTimer.isPaused ? (
                    <div className="flex gap-2">
                      <div className="w-3 h-8 bg-black"></div>
                      <div className="w-3 h-8 bg-black"></div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-black"></div>
                  )}
                  <span>{getStatusText()}</span>
                </div>
                {activeTimer.isPaused && (
                  <div className="bg-black/20 rounded-full px-4 py-2 text-lg font-mono">
                    {formatDuration(activeTimer.currentPauseDuration)}
                  </div>
                )}
              </div>
            </div>

            {/* Timer ID */}
            <div className="text-6xl font-bold text-blue-400 mb-8">
              TIMER {activeTimer.id}
            </div>
          </div>
        </div>

        {/* All Timers Horizontal Display */}
        <div className="mb-8">
          <div className="grid grid-cols-5 gap-4 h-32">
            {clockState.timers.map((timer) => {
              const progress = getProgressPercentage(timer);
              const isActive = timer.id === clockState.activeTimerId;
              
              return (
                <div
                  key={timer.id}
                  className={`bg-gray-900 rounded-xl p-4 border-2 transition-all ${
                    isActive ? 'border-blue-500 bg-gray-800' : 'border-gray-700'
                  }`}
                >
                  {/* Timer ID and Time */}
                  <div className="text-center mb-2">
                    <div className={`text-lg font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                      T{timer.id}
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                      {formatTime(timer.minutes, timer.seconds)}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <Progress 
                      value={progress} 
                      className="h-2 bg-gray-700"
                    />
                  </div>
                  
                  {/* Status and Elapsed */}
                  <div className="text-center">
                    <div className={`text-xs font-bold ${
                      timer.isPaused ? 'text-yellow-400' : 
                      timer.isRunning ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {timer.isPaused ? 'PAUSED' : timer.isRunning ? 'RUN' : 'STOP'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTime(timer.elapsedMinutes, timer.elapsedSeconds)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Buttons */}
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

        {/* Footer Stats */}
        <div className="flex justify-between items-center text-white text-lg h-8">
          <div className="flex gap-6">
            <div>
              Elapsed: {formatTime(activeTimer.elapsedMinutes, activeTimer.elapsedSeconds)}
            </div>
            {activeTimer.totalPausedTime > 0 && (
              <div className="text-yellow-400">
                Total Paused: {formatDuration(activeTimer.totalPausedTime)}
              </div>
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
