
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Edit2 } from 'lucide-react';

interface TimerControlsProps {
  timer: any;
  onPlayPause: (timer: any) => void;
  onReset: (timerId: number) => void;
  onEdit: (timer: any) => void;
  onAdjustTime: (timerId: number, seconds: number) => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  timer,
  onPlayPause,
  onReset,
  onEdit,
  onAdjustTime
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause(timer);
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
          onReset(timer.id);
        }}
        className="h-12 px-4 bg-red-600 hover:bg-red-500 text-white"
      >
        <RotateCcw className="w-5 h-5 mr-1" />
        Reset
      </Button>
      
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(timer);
        }}
        className="h-12 px-4 bg-gray-600 hover:bg-gray-500 text-white"
      >
        <Edit2 className="w-5 h-5 mr-1" />
        Edit
      </Button>
      
      <div className="flex gap-1">
        {[1, 5, 15].map((seconds) => (
          <Button
            key={seconds}
            onClick={(e) => {
              e.stopPropagation();
              onAdjustTime(timer.id, seconds);
            }}
            className="h-12 px-2 bg-gray-600 hover:bg-gray-500 text-white text-sm"
          >
            +{seconds}s
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimerControls;
