import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Plus, Minus, Server, Timer } from 'lucide-react';
import { ClockState } from '@/types/clock';

interface SettingsTabProps {
  clockState: ClockState;
  onSetTimerTime: (timerId: number, minutes: number, seconds: number) => void;
  onSetTimerName: (timerId: number, name: string) => void;
  serverPort: number;
  onSetServerPort: (port: number) => void;
  onSetHeader: (text: string) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  clockState,
  onSetTimerTime,
  onSetTimerName,
  serverPort,
  onSetServerPort,
  onSetHeader
}) => {
  const [nameValues, setNameValues] = useState<Record<number, string>>(() => {
    const vals: Record<number, string> = {};
    clockState.timers.forEach(t => {
      vals[t.id] = t.name || `Timer ${t.id}`;
    });
    return vals;
  });

  const [headerText, setHeaderText] = useState(clockState.clockPrettyHeader || 'TIMER OVERVIEW');
  const [portValue, setPortValue] = useState<number>(serverPort);
  const nameValuesRef = React.useRef(nameValues);

  useEffect(() => {
    nameValuesRef.current = nameValues;
  }, [nameValues]);

  useEffect(() => {
    return () => {
      Object.entries(nameValuesRef.current).forEach(([id, name]) => {
        onSetTimerName(Number(id), name);
      });
    };
  }, []);

  useEffect(() => {
    setNameValues(prev => {
      const vals = { ...prev };
      clockState.timers.forEach(t => {
        vals[t.id] = prev[t.id] ?? (t.name || `Timer ${t.id}`);
      });
      return vals;
    });
  }, [clockState.timers]);

  const handleTimerTimeChange = (timerId: number, minutes: number, seconds: number) => {
    onSetTimerTime(timerId, minutes, seconds);
  };

  const handleTimerNameChange = (timerId: number, value: string) => {
    setNameValues(prev => ({ ...prev, [timerId]: value }));
  };

  const commitTimerName = (timerId: number) => {
    const name = nameValues[timerId] ?? `Timer ${timerId}`;
    setNameValues(prev => ({ ...prev, [timerId]: name }));
    onSetTimerName(timerId, name);
  };

  const handleHeaderTextChange = (value: string) => {
    setHeaderText(value);
    onSetHeader(value);
  };

  return (
    <div className="space-y-6 p-4 min-h-screen bg-gray-900">
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-4xl text-white mb-4">Timer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Clock Pretty Header Setting */}
          <Card className="bg-gray-700 border-gray-500">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Clock className="w-8 h-8" />
                Clock Pretty Display Header
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <label className="text-white text-xl font-medium">Header Text</label>
                <Input
                  type="text"
                  value={headerText}
                  onChange={(e) => handleHeaderTextChange(e.target.value)}
                  className="h-16 bg-gray-700 border-gray-500 text-center text-white text-2xl font-bold rounded-xl max-w-md"
                  placeholder="TIMER OVERVIEW"
                />
              </div>
            </CardContent>
          </Card>

          {/* Individual Timer Controls */}
          <Card className="bg-gray-700 border-gray-500">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Timer className="w-8 h-8" />
                Individual Timer Configuration (Auto-Save)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clockState.timers.map((timer) => (
                <div key={timer.id} className="bg-gray-600 border border-gray-400 rounded-lg p-6">
                  <div className="flex items-center gap-6">
                    {/* Timer Name/Identifier */}
                    <div className="flex flex-col items-center">
                      <label className="text-white text-sm mb-1">Timer Name/ID</label>
                      <Input
                        type="text"
                        value={nameValues[timer.id] ?? timer.name ?? `Timer ${timer.id}`}
                        onChange={(e) => handleTimerNameChange(timer.id, e.target.value)}
                        onBlur={() => commitTimerName(timer.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            commitTimerName(timer.id);
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="h-12 bg-gray-700 border-gray-500 text-center text-white text-lg font-medium rounded-lg w-64"
                        placeholder={`Timer ${timer.id}`}
                      />
                    </div>

                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <label className="text-white text-sm mb-1">Minutes</label>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleTimerTimeChange(timer.id, Math.max(0, timer.initialTime.minutes - 1), timer.initialTime.seconds)}
                          size="sm"
                          className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={timer.initialTime.minutes}
                          onChange={(e) => handleTimerTimeChange(timer.id, parseInt(e.target.value) || 0, timer.initialTime.seconds)}
                          className="h-12 bg-gray-700 border-gray-500 text-center text-white text-lg font-bold rounded-lg w-16"
                        />
                        <Button
                          onClick={() => handleTimerTimeChange(timer.id, Math.min(59, timer.initialTime.minutes + 1), timer.initialTime.seconds)}
                          size="sm"
                          className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                      <label className="text-white text-sm mb-1">Seconds</label>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleTimerTimeChange(timer.id, timer.initialTime.minutes, Math.max(0, timer.initialTime.seconds - 1))}
                          size="sm"
                          className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={timer.initialTime.seconds}
                          onChange={(e) => handleTimerTimeChange(timer.id, timer.initialTime.minutes, parseInt(e.target.value) || 0)}
                          className="h-12 bg-gray-700 border-gray-500 text-center text-white text-lg font-bold rounded-lg w-16"
                        />
                        <Button
                          onClick={() => handleTimerTimeChange(timer.id, timer.initialTime.minutes, Math.min(59, timer.initialTime.seconds + 1))}
                          size="sm"
                          className="h-8 w-8 bg-gray-400 hover:bg-gray-300 text-black rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div className="flex flex-col items-center text-sm text-gray-300">
                      <div className="text-center">
                        <div className="font-medium">Current: {timer.minutes}:{timer.seconds.toString().padStart(2, '0')}</div>
                        <div className="text-xs">Status: {timer.isRunning ? (timer.isPaused ? 'Paused' : 'Running') : 'Stopped'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Server Port Setting */}
          <Card className="bg-gray-700 border-gray-500">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Server className="w-8 h-8" />
                Server Port
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  max="65535"
                  value={portValue}
                  onChange={(e) => setPortValue(parseInt(e.target.value) || 0)}
                  className="h-12 bg-gray-700 border-gray-500 text-center text-white text-lg font-bold rounded-lg w-32"
                />
                <Button onClick={() => onSetServerPort(portValue)} className="h-12 bg-gray-400 hover:bg-gray-300 text-black rounded-lg">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
