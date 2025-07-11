
import React from 'react';
import { Input } from '@/components/ui/input';
import { formatTime } from '@/utils/clockUtils';
import TimerControls from './TimerControls';
import TimerProgressBar from './TimerProgressBar';
import TimerEditModal from './TimerEditModal';

interface TimerRowProps {
  timer: any;
  isActive: boolean;
  isEditing: boolean;
  isEditingName: boolean;
  editNameValue: string;
  editMinutes: number;
  editSeconds: number;
  backgroundColorClass: string;
  onSetActiveTimer: (timerId: number) => void;
  onStartNameEdit: (timer: any) => void;
  onSaveNameEdit: () => void;
  onCancelNameEdit: () => void;
  setEditNameValue: (value: string) => void;
  onPlayPause: (timer: any) => void;
  onReset: (timerId: number) => void;
  onEdit: (timer: any) => void;
  onAdjustTime: (timerId: number, seconds: number) => void;
  setEditMinutes: (minutes: number) => void;
  setEditSeconds: (seconds: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  getProgressColor: (timer: any) => string;
  getProgressPercentage: (timer: any) => number;
}

const TimerRow: React.FC<TimerRowProps> = ({
  timer,
  isActive,
  isEditing,
  isEditingName,
  editNameValue,
  editMinutes,
  editSeconds,
  backgroundColorClass,
  onSetActiveTimer,
  onStartNameEdit,
  onSaveNameEdit,
  onCancelNameEdit,
  setEditNameValue,
  onPlayPause,
  onReset,
  onEdit,
  onAdjustTime,
  setEditMinutes,
  setEditSeconds,
  onSaveEdit,
  onCancelEdit,
  getProgressColor,
  getProgressPercentage
}) => {
  const displayTime = formatTime(timer.minutes, timer.seconds);
  const elapsedTime = formatTime(timer.elapsedMinutes, timer.elapsedSeconds);

  return (
    <div
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
                onBlur={onSaveNameEdit}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    onSaveNameEdit();
                  } else if (e.key === 'Escape') {
                    onCancelNameEdit();
                  }
                }}
                className="bg-transparent border-b-2 border-blue-500 text-3xl font-bold text-white p-0 h-auto focus:outline-none"
                autoFocus
              />
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onStartNameEdit(timer);
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

          {/* Control Buttons */}
          <TimerControls
            timer={timer}
            onPlayPause={onPlayPause}
            onReset={onReset}
            onEdit={onEdit}
            onAdjustTime={onAdjustTime}
          />
        </div>

        {/* Progress Bar */}
        <TimerProgressBar
          timer={timer}
          getProgressColor={getProgressColor}
          getProgressPercentage={getProgressPercentage}
        />
      </div>

      {/* Time Edit Modal */}
      {isEditing && (
        <TimerEditModal
          editMinutes={editMinutes}
          editSeconds={editSeconds}
          setEditMinutes={setEditMinutes}
          setEditSeconds={setEditSeconds}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  );
};

export default TimerRow;
