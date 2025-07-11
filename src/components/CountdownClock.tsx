import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Info, Server, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClockState, SingleTimer } from '@/types/clock';
import { useDebugLog } from '@/hooks/useDebugLog';

import ClockDisplay from './ClockDisplay';
import SettingsTab from './SettingsTab';
import InfoTab from './InfoTab';
import ApiInfoTab from './ApiInfoTab';
import DebugTab from './DebugTab';

const CountdownClock = () => {
  const createInitialTimer = (id: number): SingleTimer => ({
    id,
    minutes: 1,
    seconds: 0,
    isRunning: false,
    isPaused: false,
    elapsedMinutes: 0,
    elapsedSeconds: 0,
    pauseStartTime: null,
    currentPauseDuration: 0,
    initialTime: { minutes: 1, seconds: 0 },
    name: `Timer ${id}`
  });

  const [clockState, setClockState] = useState<ClockState>({
    timers: Array.from({ length: 5 }, (_, i) => createInitialTimer(i + 1)),
    activeTimerId: 1,
    clockPrettyHeader: 'TIMER OVERVIEW',
    port: typeof window !== 'undefined' && window.location.port
      ? parseInt(window.location.port)
      : 8080
  });

  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('clock');
  const [ipAddress, setIpAddress] = useState('');
  const [connectedClients, setConnectedClients] = useState<any[]>([]);

  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  
  const { addDebugLog, ...debugLogProps } = useDebugLog();

  useEffect(() => {
    setIpAddress(window.location.hostname || 'localhost');
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        console.log('Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected - syncing with server');
          addDebugLog('WEBSOCKET', 'Connected to server', { endpoint: wsUrl });
          
          ws.send(JSON.stringify({
            type: 'sync-settings',
            url: window.location.href,
            timers: clockState.timers,
            clockPrettyHeader: clockState.clockPrettyHeader
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            addDebugLog('WEBSOCKET', 'Received from server', data);
            
            if (data.type === 'status') {
              setClockState(prev => ({
                ...prev,
                ...data
              }));

            } else if (data.type === 'clients') {
              setConnectedClients(data.clients || []);
              addDebugLog('WEBSOCKET', 'Connected clients updated', { count: data.clients?.length || 0 });
            } else if (data.type === 'request-hostname') {
              ws.send(
                JSON.stringify({
                  type: 'client-hostname',
                  hostname: window.location.hostname
                })
              );
            } else {
              handleExternalCommand(data);
            }
          } catch (error) {
            console.error('Invalid WebSocket message:', error);
            addDebugLog('WEBSOCKET', 'Invalid message', { error });
          }
        };

        ws.onerror = (error) => {
          console.log('WebSocket connection failed:', error);
          addDebugLog('WEBSOCKET', 'Connection failed', { error });
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed, attempting to reconnect...');
          addDebugLog('WEBSOCKET', 'Connection closed, reconnecting');
          setTimeout(connectWebSocket, 2000);
        };

        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.log('WebSocket not available:', error);
        addDebugLog('WEBSOCKET', 'Not available', { error: error.message });
      }
    };

    connectWebSocket();
  }, []);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'sync-settings', clockPrettyHeader: clockState.clockPrettyHeader })
      );
    }
  }, [clockState.clockPrettyHeader]);


  const handleExternalCommand = (command: any) => {
    addDebugLog('API', 'External command received', command);
    switch (command.action) {
      case 'start':
        toast({ title: `Timer ${command.timerId || clockState.activeTimerId} Started` });
        break;
      case 'pause':
        const timer = clockState.timers.find(t => t.id === (command.timerId || clockState.activeTimerId));
        toast({ title: timer?.isPaused ? "Timer Resumed" : "Timer Paused" });
        break;
      case 'reset':
        toast({ title: `Timer ${command.timerId || clockState.activeTimerId} Reset` });
        break;
      case 'set-time':
        toast({ title: `Timer ${command.timerId || clockState.activeTimerId} Time Set` });
        break;
      case 'adjust-time':
        break;
      case 'set-port':
        toast({ title: `Server moved to port ${command.port}` });
        setTimeout(() => {
          window.location.href = `${window.location.protocol}//${window.location.hostname}:${command.port}`;
        }, 500);
        break;
    }
  };

  const startTimer = async (timerId: number) => {
    try {
      const response = await fetch(`/api/timer/${timerId}/start`, { method: 'POST' });
      if (response.ok) {
        addDebugLog('UI', `Timer ${timerId} started via API`);
      }
    } catch (error) {
      addDebugLog('UI', `Failed to start timer ${timerId}`, { error: error.message });
    }
  };

  const pauseTimer = async (timerId: number) => {
    try {
      const response = await fetch(`/api/timer/${timerId}/pause`, { method: 'POST' });
      if (response.ok) {
        addDebugLog('UI', `Timer ${timerId} paused/resumed via API`);
      }
    } catch (error) {
      addDebugLog('UI', `Failed to pause/resume timer ${timerId}`, { error: error.message });
    }
  };

  const resetTimer = async (timerId: number) => {
    try {
      const response = await fetch(`/api/timer/${timerId}/reset`, { method: 'POST' });
      if (response.ok) {
        addDebugLog('UI', `Timer ${timerId} reset via API`);
      }
    } catch (error) {
      addDebugLog('UI', `Failed to reset timer ${timerId}`, { error: error.message });
    }
  };

  const adjustTimeBySeconds = async (timerId: number, secondsToAdd: number) => {
    const timer = clockState.timers.find(t => t.id === timerId);
    if (!timer) return;
    
    try {
      const response = await fetch(`/api/timer/${timerId}/adjust-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seconds: secondsToAdd })
      });
      
      if (response.ok) {
        addDebugLog('UI', `Timer ${timerId} time adjusted via API`, { adjustment: secondsToAdd });
      }
    } catch (error) {
      addDebugLog('UI', `Failed to adjust timer ${timerId} time`, { error: error.message });
    }
  };

  const setTimerTime = async (timerId: number, minutes: number, seconds: number) => {
    const validMinutes = Math.max(0, Math.min(59, minutes));
    const validSeconds = Math.max(0, Math.min(59, seconds));
    
    try {
      const response = await fetch(`/api/timer/${timerId}/set-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: validMinutes, seconds: validSeconds })
      });
      
      if (response.ok) {
        addDebugLog('UI', `Timer ${timerId} time set via API`, { minutes: validMinutes, seconds: validSeconds });
      }
    } catch (error) {
      addDebugLog('UI', `Failed to set timer ${timerId} time`, { error: error.message });
    }
  };

  const setTimerName = async (timerId: number, name: string) => {
    setClockState(prev => ({
      ...prev,
      timers: prev.timers.map(t =>
        t.id === timerId ? { ...t, name } : t
      )
    }));

    try {
      const response = await fetch(`/api/timer/${timerId}/set-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        addDebugLog('UI', `Timer ${timerId} name set via API`, { name });
      }
    } catch (error) {
      addDebugLog('UI', `Failed to set timer ${timerId} name`, { error: (error as Error).message });
    }
  };


  const changeServerPort = async (port: number) => {
    try {
      await fetch('/api/set-port', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port })
      });
    } catch (error) {
      addDebugLog('UI', 'Failed to change server port', { error });
      return;
    }

    toast({ title: `Server port changed to ${port}` });
    window.location.href = `${window.location.protocol}//${window.location.hostname}:${port}`;
  };

  const handleCommandCopy = (command: string) => {
    addDebugLog('UI', 'Command copied', { command });
    toast({ title: 'Command Copied', description: command });
  };

  const activeTimer = clockState.timers.find(t => t.id === clockState.activeTimerId);

  return (
    <div className="min-h-screen bg-black text-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <TabsList className="grid w-full grid-cols-4 mb-0 bg-gray-800 border-gray-700">
          <TabsTrigger value="clock" className="text-lg py-3 data-[state=active]:bg-gray-600">Display</TabsTrigger>
          <TabsTrigger value="settings" className="text-lg py-3 data-[state=active]:bg-gray-600">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="api" className="text-lg py-3 data-[state=active]:bg-gray-600">
            <Server className="w-5 h-5 mr-2" />
            API Info
          </TabsTrigger>
          <TabsTrigger value="debug" className="text-lg py-3 data-[state=active]:bg-gray-600">
            <Bug className="w-5 h-5 mr-2" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="p-0 m-0 h-screen">
          <ClockDisplay
            clockState={clockState}
            ipAddress={ipAddress}
            onTogglePlayPause={() => pauseTimer(clockState.activeTimerId || 1)}
            onResetTime={() => resetTimer(clockState.activeTimerId || 1)}
            onAdjustTimeBySeconds={(id, seconds) => adjustTimeBySeconds(id, seconds)}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResetTimer={resetTimer}
            onSetTimerTime={setTimerTime}
            onSetActiveTimer={(id) => setClockState(prev => ({ ...prev, activeTimerId: id }))}
            onSetTimerName={setTimerName}
          />
        </TabsContent>

        <TabsContent value="settings" className={`pt-0 ${activeTab !== 'clock' ? 'mt-[140px]' : ''}`}>
          <div className="p-6">
            <SettingsTab
              clockState={clockState}
              onSetTimerTime={setTimerTime}
              onSetTimerName={setTimerName}
              serverPort={clockState.port || 8080}
              onSetServerPort={changeServerPort}
              onSetHeader={(text) => setClockState(prev => ({ ...prev, clockPrettyHeader: text }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="api" className={`pt-0 ${activeTab !== 'clock' ? 'mt-[140px]' : ''}`}>
          <div className="p-6">
            <ApiInfoTab
              ipAddress={ipAddress}
              onCommandCopy={handleCommandCopy}
            />
          </div>
        </TabsContent>

        <TabsContent value="debug" className={`pt-0 ${activeTab !== 'clock' ? 'mt-[140px]' : ''}`}>
          <div className="p-6">
            <DebugTab
              {...debugLogProps}
              onClearDebugLog={debugLogProps.clearDebugLog}
              connectedClients={connectedClients}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CountdownClock;
