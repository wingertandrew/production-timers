
# Multi-Timer Application

A modern web-based countdown timer application featuring 5 discrete timers with API control and real-time synchronization.

## Features

### Timer System
- **5 Discrete Timers**: Independent countdown timers (Timer 1-5)
- **Active Timer Display**: Large format display optimized for 1920x1080 screens
- **Progress Visualization**: Progress bars showing elapsed and remaining time
- **Real-time Updates**: WebSocket-powered live updates across all connected clients

### Timer Controls
- **Start/Pause/Resume**: Individual control for each timer
- **Reset**: Reset individual timers to their initial time
- **Time Adjustment**: Add/subtract seconds from timers (when stopped or paused)
- **Active Timer Selection**: Switch between timers for main display

### Display Modes
- **Main Display**: Large horizontal layout with progress bars
- **Timer Cards**: Grid view of all timers with individual controls
- **Floating Clock**: Compact timer bar for non-display tabs

### API Control
Complete REST API for external timer control:

#### Timer Operations
- `POST /api/timer/{id}/start` - Start a specific timer
- `POST /api/timer/{id}/pause` - Pause/resume a specific timer  
- `POST /api/timer/{id}/reset` - Reset a specific timer
- `POST /api/timer/{id}/set-time` - Set timer duration (minutes, seconds)
- `POST /api/timer/{id}/adjust-time` - Adjust timer by seconds

#### System Operations
- `GET /api/status` - Get current state of all timers
- `POST /api/set-ntp-sync` - Configure NTP synchronization

### Time Synchronization
- **NTP Sync**: Optional network time synchronization
- **Drift Correction**: Automatic time drift detection and correction
- **Sync Status**: Real-time NTP health monitoring

### Technical Features
- **WebSocket Communication**: Real-time updates between server and clients
- **Responsive Design**: Optimized for 1920x1080 displays
- **Debug Logging**: Comprehensive logging for troubleshooting
- **Client Management**: Track connected clients

## Usage

### Web Interface
1. **Display Tab**: Main timer display with large text and progress bars
2. **Timers Tab**: Individual timer cards with controls
3. **Settings Tab**: Configure timer duration and NTP settings
4. **API Info Tab**: API endpoint documentation and examples
5. **Debug Tab**: System logs and connection status

### API Examples

Start Timer 1:
```bash
curl -X POST http://localhost:8080/api/timer/1/start
```

Set Timer 2 to 10 minutes:
```bash
curl -X POST http://localhost:8080/api/timer/2/set-time \
  -H "Content-Type: application/json" \
  -d '{"minutes": 10, "seconds": 0}'
```

Get system status:
```bash
curl http://localhost:8080/api/status
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Start the WebSocket server:
```bash
node server.js
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + WebSocket
- **State Management**: React hooks with WebSocket synchronization
- **UI Components**: Shadcn/ui component library

## Timer States

Each timer maintains:
- Current time (minutes:seconds)
- Running/paused/stopped status
- Elapsed time tracking
- Total pause duration
- Initial time configuration

## API Response Format

```json
{
  "timers": [
    {
      "id": 1,
      "minutes": 5,
      "seconds": 30,
      "isRunning": true,
      "isPaused": false,
      "elapsedMinutes": 2,
      "elapsedSeconds": 15,
      "totalPausedTime": 30,
      "currentPauseDuration": 0,
      "initialTime": { "minutes": 8, "seconds": 0 }
    }
  ],
  "activeTimerId": 1,
  "ntpSyncEnabled": false,
  "ntpOffset": 0
}
```
