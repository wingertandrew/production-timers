
import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

let server = http.createServer(app);
let wss = new WebSocketServer({ server });

function initWebSocketServer() {
  wss.on('connection', handleWsConnection);
}
initWebSocketServer();


// Server-side timer state
const createInitialTimer = (id) => ({
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
  startTime: { minutes: 1, seconds: 0 },
  lastUpdateTime: Date.now(),
  name: `Timer ${id}`
});

let serverClockState = {
  timers: Array.from({ length: 5 }, (_, i) => createInitialTimer(i + 1)),
  activeTimerId: 1,
  port: Number(process.env.PORT) || 8080,
  clockPrettyHeader: 'TIMER OVERVIEW'
};

let serverTimers = {};

let currentPort = serverClockState.port;

// Track connected WebSocket clients
const connectedClients = new Map();

function normalizeIp(ip) {
  if (!ip) return '';
  if (ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }
  if (ip === '::1') return '127.0.0.1';
  return ip;
}

function broadcastClients() {
  const clients = Array.from(connectedClients.values()).map(c => ({
    id: c.id,
    ip: c.ip,
    url: c.url,
    hostname: c.hostname,
    connectedAt: c.connectedAt
  }));
  broadcast({ type: 'clients', clients });
}

function broadcast(data) {
  const message = JSON.stringify({
    ...data,
    serverTime: Date.now()
  });
  console.log('Broadcasting to', wss.clients.size, 'clients:', data.type || data.action);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}



function startServer(port) {
  return new Promise(resolve => {
    server.listen(port, () => {
      currentPort = port;
      serverClockState.port = port;
      console.log(`Server listening on http://localhost:${port}`);
      console.log(`API Documentation: http://localhost:${port}/api/docs`);
      resolve();
    });
  });
}

function startServerTimer(timerId) {
  if (serverTimers[timerId]) {
    clearInterval(serverTimers[timerId]);
  }
  
  console.log(`Starting server timer ${timerId}`);
  serverTimers[timerId] = setInterval(() => {
    const timer = serverClockState.timers.find(t => t.id === timerId);
    if (!timer) return;
    
    if (timer.isRunning && !timer.isPaused) {
      updateServerTimer(timerId);
      broadcast({
        type: 'status',
        ...serverClockState
      });
    }
    
    // Update pause duration if paused
    if (timer.isPaused && timer.pauseStartTime) {
      const pauseDuration = Math.floor(
        (Date.now() - timer.pauseStartTime) / 1000
      );
      timer.currentPauseDuration = pauseDuration;
      broadcast({
        type: 'status',
        ...serverClockState
      });
    }
  }, 1000);
}

function stopServerTimer(timerId) {
  if (serverTimers[timerId]) {
    clearInterval(serverTimers[timerId]);
    delete serverTimers[timerId];
    console.log(`Stopped server timer ${timerId}`);
  }
}

function updateServerTimer(timerId) {
  const timer = serverClockState.timers.find(t => t.id === timerId);
  if (!timer) return;
  
  const now = Date.now();
  const elapsed = now - timer.lastUpdateTime;
  if (elapsed < 1000) return;
  
  const ticks = Math.floor(elapsed / 1000);
  timer.lastUpdateTime += ticks * 1000;

  for (let i = 0; i < ticks; i++) {
    const newSeconds = timer.seconds - 1;
    const newMinutes = newSeconds < 0 ? timer.minutes - 1 : timer.minutes;
    const adjustedSeconds = newSeconds < 0 ? 59 : newSeconds;

    const totalElapsed = (timer.startTime.minutes * 60 + timer.startTime.seconds) -
      (newMinutes * 60 + adjustedSeconds);
    const elapsedMinutes = Math.floor(totalElapsed / 60);
    const elapsedSeconds = totalElapsed % 60;

    const countdownFinished = newMinutes < 0 || (newMinutes === 0 && adjustedSeconds === 0);

    if (countdownFinished) {
      // Timer completed
      timer.isRunning = false;
      timer.minutes = 0;
      timer.seconds = 0;
      timer.elapsedMinutes = elapsedMinutes;
      timer.elapsedSeconds = elapsedSeconds;
      stopServerTimer(timerId);
      console.log(`Timer ${timerId} completed`);
    } else {
      timer.minutes = newMinutes;
      timer.seconds = adjustedSeconds;
      timer.elapsedMinutes = elapsedMinutes;
      timer.elapsedSeconds = elapsedSeconds;
    }
  }
}

function handleWsConnection(ws) {
  console.log('New WebSocket connection established');
  const clientInfo = {
    id: Math.random().toString(36).slice(2),
    ip: normalizeIp(ws._socket.remoteAddress),
    url: '',
    hostname: '',
    connectedAt: Date.now()
  };

  connectedClients.set(ws, clientInfo);
  // Send current server state to new connections
  ws.send(
    JSON.stringify({
      type: 'status',
      ...serverClockState
    })
  );
  broadcastClients();
  ws.send(JSON.stringify({ type: 'request-hostname' }));

  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg.toString());
      console.log('WebSocket message received:', data.type);
      if (data.type === 'sync-settings') {
        // Sync settings from client
        if (data.timers && Array.isArray(data.timers)) {
          serverClockState.timers = data.timers;
        }
        if (typeof data.clockPrettyHeader === 'string') {
          serverClockState.clockPrettyHeader = data.clockPrettyHeader;
        }
        // ignore NTP settings
        if (data.url) {
          const info = connectedClients.get(ws);
          if (info) {
            info.url = data.url;
          }
        }
        broadcastClients();
        console.log('Settings synced from client');
      } else if (data.type === 'client-hostname') {
        const info = connectedClients.get(ws);
        if (info) {
          info.hostname = data.hostname || '';
          broadcastClients();
        }
      }
    } catch (err) {
      console.error('Invalid WS message', err);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    connectedClients.delete(ws);
    broadcastClients();
  });
}

// Timer-specific API endpoints
app.post('/api/timer/:id/start', (req, res) => {
  const timerId = parseInt(req.params.id);
  const timer = serverClockState.timers.find(t => t.id === timerId);
  
  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  console.log(`API: Start timer ${timerId}`);
  if (!timer.isRunning) {
    timer.startTime = {
      minutes: timer.minutes,
      seconds: timer.seconds
    };
  }
  if (timer.isPaused && timer.pauseStartTime) {
    timer.currentPauseDuration = 0;
  }
  timer.isRunning = true;
  timer.isPaused = false;
  timer.pauseStartTime = null;
  timer.currentPauseDuration = 0;
  timer.lastUpdateTime = Date.now();
  
  startServerTimer(timerId);
  broadcast({ action: 'start', timerId });
  res.json({ success: true });
});

app.post('/api/timer/:id/pause', (req, res) => {
  const timerId = parseInt(req.params.id);
  const timer = serverClockState.timers.find(t => t.id === timerId);
  
  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  console.log(`API: Pause/Resume timer ${timerId}`);
  if (timer.isPaused) {
    // Resume
    if (timer.pauseStartTime) {
      timer.currentPauseDuration = 0;
    }
    timer.isPaused = false;
    timer.pauseStartTime = null;
    timer.currentPauseDuration = 0;
    timer.lastUpdateTime = Date.now();
  } else {
    // Pause
    timer.isPaused = true;
    timer.pauseStartTime = Date.now();
    timer.lastUpdateTime = timer.pauseStartTime;
  }
  broadcast({ action: 'pause', timerId });
  res.json({ success: true });
});

app.post('/api/timer/:id/play-pause', (req, res) => {
  const timerId = parseInt(req.params.id);
  const timer = serverClockState.timers.find(t => t.id === timerId);

  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }

  console.log(`API: Play/Pause toggle timer ${timerId}`);

  if (!timer.isRunning) {
    if (!timer.isRunning) {
      timer.startTime = {
        minutes: timer.minutes,
        seconds: timer.seconds
      };
    }
    if (timer.isPaused && timer.pauseStartTime) {
      timer.currentPauseDuration = 0;
    }
    timer.isRunning = true;
    timer.isPaused = false;
    timer.pauseStartTime = null;
    timer.currentPauseDuration = 0;
    timer.lastUpdateTime = Date.now() + serverClockState.ntpOffset;
    startServerTimer(timerId);
    broadcast({ action: 'start', timerId });
  } else {
    if (timer.isPaused) {
      if (timer.pauseStartTime) {
        timer.currentPauseDuration = 0;
      }
      timer.isPaused = false;
      timer.pauseStartTime = null;
      timer.currentPauseDuration = 0;
      timer.lastUpdateTime = Date.now() + serverClockState.ntpOffset;
      broadcast({ action: 'pause', timerId });
    } else {
      timer.isPaused = true;
      timer.pauseStartTime = Date.now() + serverClockState.ntpOffset;
      timer.lastUpdateTime = timer.pauseStartTime;
      broadcast({ action: 'pause', timerId });
    }
  }

  res.json({ success: true });
});

app.post('/api/timer/:id/reset', (req, res) => {
  const timerId = parseInt(req.params.id);
  const timer = serverClockState.timers.find(t => t.id === timerId);
  
  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  console.log(`API: Reset timer ${timerId}`);
  timer.minutes = timer.initialTime.minutes;
  timer.seconds = timer.initialTime.seconds;
  timer.startTime = { ...timer.initialTime };
  timer.isRunning = false;
  timer.isPaused = false;
  timer.elapsedMinutes = 0;
  timer.elapsedSeconds = 0;
  timer.pauseStartTime = null;
  timer.currentPauseDuration = 0;
  timer.lastUpdateTime = Date.now();
  
  stopServerTimer(timerId);
  broadcast({ action: 'reset', timerId });
  broadcast({ type: 'status', ...serverClockState });
  res.json({ success: true });
});

app.post('/api/timer/:id/adjust-time', (req, res) => {
  const timerId = parseInt(req.params.id);
  const timer = serverClockState.timers.find(t => t.id === timerId);
  const { seconds } = req.body;
  
  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  console.log(`API: Adjust timer ${timerId} by ${seconds} seconds`);
  if (typeof seconds === 'number') {
    const totalSeconds = timer.minutes * 60 + timer.seconds + seconds;
    const newMinutes = Math.floor(Math.max(0, totalSeconds) / 60);
    const newSeconds = Math.max(0, totalSeconds) % 60;

    timer.minutes = newMinutes;
    timer.seconds = newSeconds;
    if (timer.isRunning) {
      const startTotal = timer.startTime.minutes * 60 + timer.startTime.seconds + seconds;
      timer.startTime = {
        minutes: Math.floor(Math.max(0, startTotal) / 60),
        seconds: Math.max(0, startTotal) % 60,
      };
    } else {
      timer.startTime = { minutes: newMinutes, seconds: newSeconds };
    }
    timer.lastUpdateTime = Date.now();

    broadcast({ action: 'adjust-time', timerId, minutes: newMinutes, seconds: newSeconds });
    broadcast({ type: 'status', ...serverClockState });
  }
  res.json({ success: true });
});

app.post('/api/timer/:id/set-time', (req, res) => {
  const timerId = parseInt(req.params.id);
  const timer = serverClockState.timers.find(t => t.id === timerId);
  const { minutes, seconds } = req.body;
  
  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  console.log(`API: Set timer ${timerId} time`);
  const newMinutes = typeof minutes === 'number' ? minutes : 5;
  const newSeconds = typeof seconds === 'number' ? seconds : 0;

  timer.initialTime = { minutes: newMinutes, seconds: newSeconds };
  timer.minutes = newMinutes;
  timer.seconds = newSeconds;
  timer.startTime = { minutes: timer.minutes, seconds: timer.seconds };
  timer.elapsedMinutes = 0;
  timer.elapsedSeconds = 0;
  timer.isRunning = false;
  timer.isPaused = false;
  timer.currentPauseDuration = 0;
  timer.pauseStartTime = null;
  
  stopServerTimer(timerId);
  broadcast({ action: 'set-time', timerId, minutes: newMinutes, seconds: newSeconds });
  broadcast({ type: 'status', ...serverClockState });
  res.json({ success: true });
});

app.post('/api/timer/:id/set-name', (req, res) => {
  const timerId = parseInt(req.params.id);
  const timer = serverClockState.timers.find(t => t.id === timerId);
  const { name } = req.body;

  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }

  console.log(`API: Set timer ${timerId} name`);
  timer.name = typeof name === 'string' ? name : '';
  broadcast({ action: 'set-name', timerId, name: timer.name });
  broadcast({ type: 'status', ...serverClockState });
  res.json({ success: true });
});

// Legacy API endpoints (for compatibility)
app.post('/api/start', (req, res) => {
  const timerId = serverClockState.activeTimerId || 1;
  req.params.id = timerId.toString();
  return app._router.handle(req, res, () => {});
});

app.post('/api/pause', (req, res) => {
  const timerId = serverClockState.activeTimerId || 1;
  req.params.id = timerId.toString();
  return app._router.handle(req, res, () => {});
});

app.post('/api/reset', (req, res) => {
  console.log('API: Reset all timers');
  serverClockState.timers.forEach(timer => {
    timer.minutes = timer.initialTime.minutes;
    timer.seconds = timer.initialTime.seconds;
    timer.startTime = { ...timer.initialTime };
    timer.isRunning = false;
    timer.isPaused = false;
    timer.elapsedMinutes = 0;
    timer.elapsedSeconds = 0;
    timer.pauseStartTime = null;
    timer.currentPauseDuration = 0;
    timer.lastUpdateTime = Date.now();
    stopServerTimer(timer.id);
  });
  broadcast({ action: 'reset' });
  broadcast({ type: 'status', ...serverClockState });
  res.json({ success: true });
});


app.post('/api/set-port', (req, res) => {
  const newPort = parseInt(req.body.port);
  if (!newPort) {
    return res.status(400).json({ error: 'Invalid port' });
  }
  if (newPort === currentPort) {
    return res.json({ success: true });
  }

  console.log(`API: Change server port to ${newPort}`);
  serverClockState.port = newPort;
  broadcast({ action: 'set-port', port: newPort });

  server.close(() => {
    wss.close();
    connectedClients.clear();
    server = http.createServer(app);
    wss = new WebSocketServer({ server });
    initWebSocketServer();
    startServer(newPort).then(() => {
      broadcast({ type: 'status', ...serverClockState });
      res.json({ success: true });
    });
  });

});


app.get('/api/status', (req, res) => {
  const { fields } = req.query;
  if (fields) {
    const requested = String(fields)
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);
    const filtered = {};
    requested.forEach(f => {
      if (Object.prototype.hasOwnProperty.call(serverClockState, f)) {
        filtered[f] = serverClockState[f];
      }
    });
    return res.json(filtered);
  }

  res.json({
    ...serverClockState,
    serverTime: Date.now(),
    api_version: "2.0.0",
    connection_protocol: "http_rest_websocket"
  });
});

// Enhanced API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: "Multi-Timer API Documentation",
    version: "2.0.0",
    base_url: `http://${req.get('host')}`,
    connection_protocols: {
      http_rest: {
        description: "HTTP REST API for timer control and status",
        base_path: "/api"
      },
      websocket: {
        description: "Real-time WebSocket updates",
        endpoint: `ws://${req.get('host')}`,
        events: ["status", "action"]
      }
    },
    endpoints: {
      timer_control: {
        "POST /api/timer/:id/start": "Start specific timer (1-5)",
        "POST /api/timer/:id/play-pause": "Toggle play/pause for specific timer (1-5)",
        "POST /api/timer/:id/pause": "Pause/Resume specific timer (1-5)",
        "POST /api/timer/:id/reset": "Reset specific timer (1-5)",
        "POST /api/timer/:id/adjust-time": {
          description: "Adjust specific timer by seconds during countdown",
          body: { seconds: "number (positive or negative)" }
        },
        "POST /api/timer/:id/set-time": {
          description: "Set specific timer duration",
          body: { minutes: "number", seconds: "number" }
        },
        "POST /api/timer/:id/set-name": {
          description: "Set specific timer name",
          body: { name: "string" }
        }
      },
      legacy_control: {
        "POST /api/start": "Start active timer (legacy)",
        "POST /api/pause": "Pause/Resume active timer (legacy)",
        "POST /api/reset": "Reset all timers"
      },
      configuration: {
        "POST /api/set-port": {
          description: "Set HTTP server port",
          body: { port: "number" }
        }
      },
      status: {
        "GET /api/status": {
          description: "Get current state of all timers",
          response_fields: {
            timers: "Array of timer objects",
            activeTimerId: "Currently selected timer ID",
            serverTime: "Server timestamp",
            api_version: "API version"
          }
        }
      },
      documentation: {
        "GET /api/docs": "This API documentation"
      }
    },
    timer_examples: {
      start_timer_1: `curl -X POST http://${req.get('host')}/api/timer/1/start`,
      play_pause_timer_1: `curl -X POST http://${req.get('host')}/api/timer/1/play-pause`,
      pause_timer_2: `curl -X POST http://${req.get('host')}/api/timer/2/pause`,
      reset_timer_3: `curl -X POST http://${req.get('host')}/api/timer/3/reset`,
      set_timer_4_time: `curl -X POST http://${req.get('host')}/api/timer/4/set-time -H "Content-Type: application/json" -d '{"minutes":10,"seconds":0}'`,
      adjust_timer_5: `curl -X POST http://${req.get('host')}/api/timer/5/adjust-time -H "Content-Type: application/json" -d '{"seconds":30}'`,
      set_timer_1_name: `curl -X POST http://${req.get('host')}/api/timer/1/set-name -H "Content-Type: application/json" -d '{"name":"Intro"}'`
    }
  });
});

const dist = join(__dirname, 'dist');
app.use(express.static(dist));
app.get('*', (_req, res) => {
  res.sendFile(join(dist, 'index.html'));
});

startServer(serverClockState.port).then(() => {
  console.log('Multi-timer server initialized with 5 discrete timers');
  broadcastClients();
});
