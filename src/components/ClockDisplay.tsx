import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Edit2 } from 'lucide-react';
import { ClockState } from '@/types/clock';
import { formatTime, formatDuration } from '@/utils/clockUtils';

interface ClockDisplayProps {
  clockState: ClockState;
  ipAddress: string;
  onTogglePlayPause: () => void;
  onResetTime: () => void;
  onAdjustTimeBySeconds: (timerId: number, seconds: number) => void;
  onStartTimer: (timerId: number) => void;
  onPauseTimer: (timerId: number) => void;
  onResetTimer: (timerId: number) => void;
  onSetTimerTime: (timerId: number, minutes: number, seconds: number) => void;
  onSetActiveTimer: (timerId: number) => void;
  onSetTimerName: (timerId: number, name: string) => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({
  clockState,
  ipAddress,
  onTogglePlayPause,
  onResetTime,
  onAdjustTimeBySeconds,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetTimerTime,
  onSetActiveTimer,
  onSetTimerName
}) => {
  const [editingTimer, setEditingTimer] = useState<number | null>(null);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editSeconds, setEditSeconds] = useState(0);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  const getTimerBackgroundColor = (timer: any) => {
    const remaining = timer.minutes * 60 + timer.seconds;
    if (remaining <= 10) {
      return 'bg-red-900/50';
    }
    if (remaining <= 20) {
      return 'bg-yellow-900/50';
    }
    if (timer.isRunning && !timer.isPaused) {
      return 'bg-green-900/50';
    }
    if (timer.isPaused) {
      return 'bg-orange-900/50';
    }
    return 'bg-gray-900';
  };

  const startEdit = (timer: any) => {
    setEditingTimer(timer.id);
    setEditMinutes(timer.initialTime.minutes);
    setEditSeconds(timer.initialTime.seconds);
  };

  const saveEdit = () => {
    if (editingTimer) {
      onSetTimerTime(editingTimer, editMinutes, editSeconds);
      setEditingTimer(null);
    }
  };

  const cancelEdit = () => {
    setEditingTimer(null);
  };

  const handlePlayPauseToggle = (timer: any) => {
    if (!timer.isRunning) {
      onStartTimer(timer.id);
    } else {
      onPauseTimer(timer.id);
    }
  };

  const startNameEdit = (timer: any) => {
    setEditingName(timer.id);
    setEditNameValue(timer.name || `Timer ${timer.id}`);
  };

  const saveNameEdit = () => {
    if (editingName && onSetTimerName) {
      onSetTimerName(editingName, editNameValue);
      setEditingName(null);
    }
  };

  const cancelNameEdit = () => {
    setEditingName(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 overflow-hidden">
      <div className="h-screen flex flex-col max-w-[1920px] mx-auto">
        {/* Header with IP and NTP Status */}
        <div className="flex justify-between items-center mb-6 h-12">
          <div className="flex items-center gap-2 text-white text-xl">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span>{ipAddress}</span>
          </div>
          
          {/* NTP status removed */}
        </div>

        {/* All Timers Stack */}
        <div className="flex-1 flex flex-col gap-1 mb-8">
          {clockState.timers.map((timer) => {
            const displayTime = formatTime(timer.minutes, timer.seconds);
            const elapsedTime = formatTime(timer.elapsedMinutes, timer.elapsedSeconds);

            const remainingSeconds = timer.minutes * 60 + timer.seconds;
            const elapsedSecs = timer.elapsedMinutes * 60 + timer.elapsedSeconds;
            const totalTime = remainingSeconds + elapsedSecs;
            const progress = totalTime > 0 ? Math.min((elapsedSecs / totalTime) * 100, 100) : 0;
            const isActive = timer.id === clockState.activeTimerId;
            const isEditing = editingTimer === timer.id;
            const isEditingName = editingName === timer.id;
            const backgroundColorClass = getTimerBackgroundColor(timer);
            
            return (
              <div
                key={timer.id}
                className={`${backgroundColorClass} border-b-2 border-gray-700 cursor-pointer transition-all ${
                  isActive ? 'border-blue-500/50' : 'hover:bg-gray-800'
                }`}
                onClick={() => onSetActiveTimer(timer.id)}
              >
                <div className="px-6 py-4">
                  <div className="flex items-center gap-6">
                    {/* Timer Name and ID - Editable */}
                    <div className={`text-3xl font-bold ${isActive ? 'text-blue-400' : 'text-white'} min-w-[200px]`}>
                      {isEditingName ? (
                        <Input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onBlur={saveNameEdit}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              saveNameEdit();
                            } else if (e.key === 'Escape') {
                              cancelNameEdit();
                            }
                          }}
                          className="bg-transparent border-b-2 border-blue-500 text-3xl font-bold text-white p-0 h-auto focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            startNameEdit(timer);
                          }}
                          className="cursor-pointer hover:underline"
                        >
                          {timer.name || `Timer ${timer.id}`}
                        </span>
                      )}
                    </div>

                    {/* Times - Centered */}
                    <div className="flex-1 flex justify-center gap-8 text-4xl font-mono">
                      <span className="text-green-400">+{elapsedTime}</span>
                      <span className="text-red-400">-{displayTime}</span>
                    </div>

                    {/* Control Buttons - Single Horizontal Line */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPauseToggle(timer);
                        }}
                        className={`h-12 px-4 text-white ${
                          timer.isRunning && !timer.isPaused 
                            ? 'bg-yellow-600 hover:bg-yellow-500' 
                            : 'bg-green-600 hover:bg-green-500'
                        }`}
                      >
                        {timer.isRunning && !timer.isPaused ? (
                          <>
                            <Pause className="w-5 h-5 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-1" />
                            {timer.isPaused ? 'Resume' : 'Start'}
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetTimer(timer.id);
                        }}
                        className="h-12 px-4 bg-red-600 hover:bg-red-500 text-white"
                      >
                        <RotateCcw className="w-5 h-5 mr-1" />
                        Reset
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(timer);
                        }}
                        className="h-12 px-4 bg-gray-600 hover:bg-gray-500 text-white"
                      >
                        <Edit2 className="w-5 h-5 mr-1" />
                        Edit
                      </Button>
                      
                      <div className="flex gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdjustTimeBySeconds(timer.id, 1);
                          }}
                          className="h-12 px-2 bg-gray-600 hover:bg-gray-500 text-white text-sm"
                        >
                          +1s
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdjustTimeBySeconds(timer.id, 5);
                          }}
                          className="h-12 px-2 bg-gray-600 hover:bg-gray-500 text-white text-sm"
                        >
                          +5s
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdjustTimeBySeconds(timer.id, 15);
                          }}
                          className="h-12 px-2 bg-gray-600 hover:bg-gray-500 text-white text-sm"
                        >
                          +15s
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar with dynamic countdown animation */}
                  <div className="mt-4">
                    <div className="w-full h-4 bg-gray-700 rounded">
                      <div
                        className="h-full rounded transition-all duration-1000 ease-linear"
                        style={{ 
                          width: `${progress}%`, 
                          backgroundColor: timer.isRunning && !timer.isPaused ? '#22c55e' : '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Time Edit Modal */}
                {isEditing && (
                  <div className="px-6 pb-4 border-t border-gray-600 pt-4">
                    <div className="flex justify-center items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-white">Minutes:</label>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
                          className="w-20 bg-gray-700 border-gray-500 text-white text-center"
                        />
                        <div className="flex flex-col ml-2 gap-1">
                          <Button size="sm" className="h-6 px-2" onClick={() => setEditMinutes(Math.min(59, editMinutes + 1))}>+</Button>
                          <Button size="sm" className="h-6 px-2" onClick={() => setEditMinutes(Math.max(0, editMinutes - 1))}>-</Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-white">Seconds:</label>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={editSeconds}
                          onChange={(e) => setEditSeconds(parseInt(e.target.value) || 0)}
                          className="w-20 bg-gray-700 border-gray-500 text-white text-center"
                        />
                        <div className="flex flex-col ml-2 gap-1">
                          <Button size="sm" className="h-6 px-2" onClick={() => setEditSeconds(Math.min(59, editSeconds + 1))}>+</Button>
                          <Button size="sm" className="h-6 px-2" onClick={() => setEditSeconds(Math.max(0, editSeconds - 1))}>-</Button>
                        </div>
                      </div>
                      <Button
                        onClick={saveEdit}
                        className="bg-green-600 hover:bg-green-500 text-white"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        className="bg-gray-600 hover:bg-gray-500 text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center text-white text-xl h-8">
          <div className="flex gap-8">
            <div>Active: {clockState.timers.find(t => t.id === clockState.activeTimerId)?.name || `Timer ${clockState.activeTimerId}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockDisplay;
