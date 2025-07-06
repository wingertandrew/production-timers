export interface ClockState {
  minutes: number;
  seconds: number;
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
  isPaused: boolean;
  elapsedMinutes: number;
  elapsedSeconds: number;
  pauseStartTime: number | null;
  totalPausedTime: number;
  currentPauseDuration: number;
  isBetweenRounds: boolean;
  betweenRoundsMinutes: number;
  betweenRoundsSeconds: number;
  betweenRoundsEnabled: boolean;
  betweenRoundsTime: number;
  ntpSyncEnabled: boolean;
  ntpSyncInterval: number;
  ntpDriftThreshold: number;
  ntpOffset: number;
  masterClockStartTime?: number;
  ntpTimestamp?: number | null;
  serverTime?: number;
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
