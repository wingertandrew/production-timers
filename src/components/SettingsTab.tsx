
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Clock, Plus, Minus, Wifi, Server, Timer } from 'lucide-react';
import { ClockState } from '@/types/clock';

interface SettingsTabProps {
  clockState: ClockState;
  ntpSyncEnabled: boolean;
  ntpSyncInterval: number;
  ntpDriftThreshold: number;
  setNtpSyncEnabled: (enabled: boolean) => void;
  setNtpSyncInterval: (interval: number) => void;
  setNtpDriftThreshold: (threshold: number) => void;
  onSetTimerTime: (timerId: number, minutes: number, seconds: number) => void;
  onApplyNtpSettings: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  clockState,
  ntpSyncEnabled,
  ntpSyncInterval,
  ntpDriftThreshold,
  setNtpSyncEnabled,
  setNtpSyncInterval,
  setNtpDriftThreshold,
  onSetTimerTime,
  onApplyNtpSettings
}) => {
  return (
    <div className="space-y-6 p-4 min-h-screen bg-gray-900">
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-4xl text-white mb-4">Timer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Individual Timer Controls */}
          <Card className="bg-gray-700 border-gray-500">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Timer className="w-8 h-8" />
                Individual Timer Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clockState.timers.map((timer) => (
                  <Card key={timer.id} className="bg-gray-600 border-gray-400">
                    <CardHeader>
                      <CardTitle className="text-xl text-white text-center">
                        Timer {timer.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                          <label className="text-white text-lg mb-2">Minutes</label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={timer.initialTime.minutes}
                            onChange={(e) => onSetTimerTime(timer.id, parseInt(e.target.value) || 0, timer.initialTime.seconds)}
                            className="h-16 bg-gray-700 border-gray-500 text-center text-white text-2xl font-bold rounded-xl w-20"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => onSetTimerTime(timer.id, Math.max(0, timer.initialTime.minutes - 1), timer.initialTime.seconds)}
                              size="sm"
                              className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => onSetTimerTime(timer.id, Math.min(59, timer.initialTime.minutes + 1), timer.initialTime.seconds)}
                              size="sm"
                              className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Seconds */}
                        <div className="flex flex-col items-center">
                          <label className="text-white text-lg mb-2">Seconds</label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={timer.initialTime.seconds}
                            onChange={(e) => onSetTimerTime(timer.id, timer.initialTime.minutes, parseInt(e.target.value) || 0)}
                            className="h-16 bg-gray-700 border-gray-500 text-center text-white text-2xl font-bold rounded-xl w-20"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => onSetTimerTime(timer.id, timer.initialTime.minutes, Math.max(0, timer.initialTime.seconds - 1))}
                              size="sm"
                              className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => onSetTimerTime(timer.id, timer.initialTime.minutes, Math.min(59, timer.initialTime.seconds + 1))}
                              size="sm"
                              className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Current Status */}
                        <div className="text-center text-sm text-gray-300">
                          Current: {timer.minutes}:{timer.seconds.toString().padStart(2, '0')}
                          <br />
                          Status: {timer.isRunning ? (timer.isPaused ? 'Paused' : 'Running') : 'Stopped'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NTP Sync Settings */}
          <Card className="bg-gray-700 border-gray-500">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Server className="w-8 h-8" />
                Network Time Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl text-white font-semibold">Enable NTP Time Sync</h3>
                  <p className="text-gray-300 text-lg">
                    Keep all remote clocks perfectly synchronized using Network Time Protocol
                  </p>
                </div>
                <Switch
                  checked={ntpSyncEnabled}
                  onCheckedChange={setNtpSyncEnabled}
                  className="scale-150"
                />
              </div>
              
              <div className={`space-y-6 ${!ntpSyncEnabled ? 'opacity-50' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <label className="block text-xl font-medium text-white">
                      Sync Interval (hours)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      value={ntpSyncInterval / 3600000}
                      onChange={(e) => setNtpSyncInterval((parseInt(e.target.value) || 6) * 3600000)}
                      disabled={!ntpSyncEnabled}
                      className="h-16 bg-gray-700 border-gray-500 text-center text-white text-2xl font-bold rounded-xl max-w-xs disabled:opacity-50"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setNtpSyncInterval(Math.max(3600000, ntpSyncInterval - 3600000))}
                        size="sm"
                        disabled={!ntpSyncEnabled}
                        className="h-12 w-12 bg-gray-400 hover:bg-gray-300 text-black rounded-lg disabled:opacity-50"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => setNtpSyncInterval(Math.min(86400000, ntpSyncInterval + 3600000))}
                        size="sm"
                        disabled={!ntpSyncEnabled}
                        className="h-12 w-12 bg-gray-400 hover:bg-gray-300 text-black rounded-lg disabled:opacity-50"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <label className="block text-xl font-medium text-white">
                      Drift Threshold (ms)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="1000"
                      value={ntpDriftThreshold}
                      onChange={(e) => setNtpDriftThreshold(parseInt(e.target.value) || 50)}
                      disabled={!ntpSyncEnabled}
                      className="h-16 bg-gray-700 border-gray-500 text-center text-white text-2xl font-bold rounded-xl max-w-xs disabled:opacity-50"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setNtpDriftThreshold(Math.max(10, ntpDriftThreshold - 10))}
                        size="sm"
                        disabled={!ntpSyncEnabled}
                        className="h-12 w-12 bg-gray-400 hover:bg-gray-300 text-black rounded-lg disabled:opacity-50"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => setNtpDriftThreshold(Math.min(1000, ntpDriftThreshold + 10))}
                        size="sm"
                        disabled={!ntpSyncEnabled}
                        className="h-12 w-12 bg-gray-400 hover:bg-gray-300 text-black rounded-lg disabled:opacity-50"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Wifi className="w-6 h-6 text-blue-400" />
                    <h4 className="text-lg font-semibold text-blue-400">Sync Configuration</h4>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>• Uses multiple NTP servers for redundancy</p>
                    <p>• Applies smooth time corrections to avoid jumps</p>
                    <p>• Maintains sync status monitoring and health checks</p>
                    <p>• Fallback to local time if all servers fail</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={onApplyNtpSettings}
                size="lg"
                className="w-full h-16 text-2xl bg-gray-400 hover:bg-gray-300 text-black rounded-xl"
              >
                Apply NTP Settings
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
