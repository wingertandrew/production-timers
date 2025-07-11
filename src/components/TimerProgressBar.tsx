
import React from 'react';

interface TimerProgressBarProps {
  timer: any;
  getProgressColor: (timer: any) => string;
  getProgressPercentage: (timer: any) => number;
}

const TimerProgressBar: React.FC<TimerProgressBarProps> = ({
  timer,
  getProgressColor,
  getProgressPercentage
}) => {
  const progress = getProgressPercentage(timer);

  return (
    <div className="mt-4">
      <div className="w-full h-4 bg-gray-700 rounded overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-1000 ease-linear ${getProgressColor(timer)}`}
          style={{
            width: `${progress}%`,
            transition: timer.isRunning ? 'width 1s linear' : 'width 0.3s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default TimerProgressBar;
