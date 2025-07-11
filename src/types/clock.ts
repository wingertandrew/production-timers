export interface SingleTimer {
  id: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  elapsedMinutes: number;
  elapsedSeconds: number;
  pauseStartTime: number | null;
  currentPauseDuration: number;
  initialTime: { minutes: number; seconds: number };
  name?: string;
}

export interface ClockState {
  timers: SingleTimer[];
  activeTimerId: number | null;
  port?: number;
  masterClockStartTime?: number;
  clockPrettyHeader?: string;
}

export interface DebugLogEntry {
  timestamp: string;
  source: 'UI' | 'API' | 'WEBSOCKET';
  action: string;
  details?: any;
}

export type DebugFilter = 'ALL' | 'UI' | 'API' | 'WEBSOCKET';
