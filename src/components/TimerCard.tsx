
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { SingleTimer } from '@/types/clock';

interface TimerCardProps {
  timer: SingleTimer;
  isActive: boolean;
  onStart: (id: number) => void;
  onPause: (id: number) => void;
  onReset: (id: number) => void;
  onAdjustTime: (id: number, seconds: number) => void;
  onSetActive: (id: number) => void;
}

const TimerCard: React.FC<TimerCardProps> = ({
  timer,
  isActive,
  onStart,
  onPause,
  onReset,
  onAdjustTime,
  onSetActive
}) => {
  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (timer.isPaused) return 'text-yellow-400';
    if (timer.isRunning) return 'text-green-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (timer.isPaused) return 'PAUSED';
    if (timer.isRunning) return 'RUNNING';
    return 'STOPPED';
  };

  return (
    <Card 
      className={`bg-gray-900 border-gray-700 cursor-pointer transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500 bg-gray-800' : 'hover:bg-gray-850'
      }`}
      onClick={() => onSetActive(timer.id)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white">
          Timer {timer.id}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-white mb-2">
            {formatTime(timer.minutes, timer.seconds)}
          </div>
          <div className={`text-sm font-bold ${getStatusColor()}`}>
            {getStatusText()}
            {timer.isPaused && (
              <div className="text-xs mt-1">
                {Math.floor(timer.currentPauseDuration / 60)}:{(timer.currentPauseDuration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>

        {/* Time Adjustment */}
        <div className="flex justify-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAdjustTime(timer.id, -10);
            }}
            disabled={timer.isRunning && !timer.isPaused}
            className="bg-gray-800 border-gray-600 hover:bg-gray-700"
          >
            <Minus className="w-3 h-3" />
            10s
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAdjustTime(timer.id, 10);
            }}
            disabled={timer.isRunning && !timer.isPaused}
            className="bg-gray-800 border-gray-600 hover:bg-gray-700"
          >
            <Plus className="w-3 h-3" />
            10s
          </Button>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!timer.isRunning || timer.isPaused) {
                onStart(timer.id);
              } else {
                onPause(timer.id);
              }
            }}
            className={timer.isRunning && !timer.isPaused ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {timer.isRunning && !timer.isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onReset(timer.id);
            }}
            className="bg-gray-800 border-gray-600 hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Elapsed Time */}
        <div className="text-center text-xs text-gray-400">
          Elapsed: {formatTime(timer.elapsedMinutes, timer.elapsedSeconds)}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerCard;
