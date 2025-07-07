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
  ntpSyncEnabled: boolean;
  ntpSyncInterval: number;
  ntpDriftThreshold: number;
  ntpOffset: number;
  masterClockStartTime?: number;
  ntpTimestamp?: number | null;
  serverTime?: number;
  clockPrettyHeader?: string;
}

export interface DebugLogEntry {
  timestamp: string;
  source: 'UI' | 'API' | 'WEBSOCKET' | 'NTP';
  action: string;
  details?: any;
}

export type DebugFilter = 'ALL' | 'UI' | 'API' | 'WEBSOCKET' | 'NTP';

export interface NTPSyncStatus {
  enabled: boolean;
  lastSync: number;
  timeOffset: number;
  healthy: boolean;
  syncCount: number;
  errorCount: number;
}
