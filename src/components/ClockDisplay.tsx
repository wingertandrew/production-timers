
import React, { useState } from 'react';
import { ClockState } from '@/types/clock';
import TimerRow from './TimerRow';

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

  const getProgressColor = (timer: any) => {
    if (!timer.isRunning) return 'bg-gray-600';
    if (timer.isPaused) return 'bg-orange-600';

    const remaining = timer.minutes * 60 + timer.seconds;
    if (remaining <= 10) return 'bg-red-600';
    if (remaining <= 20) return 'bg-yellow-500';

    return 'bg-green-600';
  };

  const getProgressPercentage = (timer: any) => {
    const remainingSeconds = timer.minutes * 60 + timer.seconds;
    const elapsedSeconds = timer.elapsedMinutes * 60 + timer.elapsedSeconds;
    const totalTime = remainingSeconds + elapsedSeconds;
    return totalTime > 0 ? Math.min((elapsedSeconds / totalTime) * 100, 100) : 0;
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
        {/* Header with IP */}
        <div className="flex justify-between items-center mb-6 h-12">
          <div className="flex items-center gap-2 text-white text-xl">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span>{ipAddress}</span>
          </div>
        </div>

        {/* All Timers Stack */}
        <div className="flex-1 flex flex-col gap-1 mb-8">
          {clockState.timers.map((timer) => {
            const isActive = timer.id === clockState.activeTimerId;
            const isEditing = editingTimer === timer.id;
            const isEditingName = editingName === timer.id;
            const backgroundColorClass = getTimerBackgroundColor(timer);
            
            return (
              <TimerRow
                key={timer.id}
                timer={timer}
                isActive={isActive}
                isEditing={isEditing}
                isEditingName={isEditingName}
                editNameValue={editNameValue}
                editMinutes={editMinutes}
                editSeconds={editSeconds}
                backgroundColorClass={backgroundColorClass}
                onSetActiveTimer={onSetActiveTimer}
                onStartNameEdit={startNameEdit}
                onSaveNameEdit={saveNameEdit}
                onCancelNameEdit={cancelNameEdit}
                setEditNameValue={setEditNameValue}
                onPlayPause={handlePlayPauseToggle}
                onReset={onResetTimer}
                onEdit={startEdit}
                onAdjustTime={onAdjustTimeBySeconds}
                setEditMinutes={setEditMinutes}
                setEditSeconds={setEditSeconds}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                getProgressColor={getProgressColor}
                getProgressPercentage={getProgressPercentage}
              />
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
