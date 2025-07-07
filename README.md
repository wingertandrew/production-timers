
# Multi-Timer Application

A modern web-based countdown timer application featuring 5 discrete timers with comprehensive API control and real-time synchronization.

## Features

### Timer System
- **5 Discrete Timers**: Independent countdown timers (Timer 1-5)
- **Individual Timer Control**: Each timer can be started, paused, reset, and configured independently
- **Active Timer Display**: Large format display optimized for 1920x1080 screens showing all timers simultaneously
- **Progress Visualization**: Progress bars showing elapsed and remaining time for each timer
- **Real-time Updates**: WebSocket-powered live updates across all connected clients

### Timer Controls
- **Start/Pause/Resume**: Individual control for each timer
- **Reset**: Reset individual timers to their initial time
- **Time Adjustment**: Add/subtract seconds from timers (when stopped or paused)
- **Active Timer Selection**: Switch between timers for main control focus
- **Individual Timer Configuration**: Set different durations for each of the 5 timers

### Display Modes
- **Main Display**: Vertical stack layout showing all 5 timers with large text and progress bars
- **Timer Cards**: Grid view of all timers with individual controls
- **Floating Clock Bar**: Compact display showing all 5 timers for non-display tabs

### Comprehensive API Control
Complete REST API for external timer control with discrete timer support:

#### Individual Timer Operations
- `POST /api/timer/{id}/start` - Start a specific timer (1-5)
- `POST /api/timer/{id}/pause` - Pause/resume a specific timer (1-5)
- `POST /api/timer/{id}/reset` - Reset a specific timer (1-5)
- `POST /api/timer/{id}/set-time` - Set timer duration (minutes, seconds)
- `POST /api/timer/{id}/adjust-time` - Adjust timer by seconds
- `POST /api/timer/{id}/set-name` - Update timer name

#### Batch Operations
- `POST /api/reset` - Reset all timers

#### System Operations
- `GET /api/status` - Get current state of all timers
- `POST /api/set-ntp-sync` - Configure NTP synchronization
- `GET /api/docs` - Complete API documentation

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
1. **Display Tab**: Main timer display showing all 5 timers vertically stacked
2. **Timers Tab**: Individual timer cards with controls
3. **Settings Tab**: Configure individual timer durations and NTP settings
4. **API Info Tab**: API endpoint documentation and examples
5. **Debug Tab**: System logs and connection status

### API Examples

#### Individual Timer Control

Use the timer ID (1-5) in place of `{id}` to control any timer.

Start a timer:
```bash
curl -X POST http://localhost:8080/api/timer/{id}/start
```

Pause or resume a timer:
```bash
curl -X POST http://localhost:8080/api/timer/{id}/pause
```

Reset a timer:
```bash
curl -X POST http://localhost:8080/api/timer/{id}/reset
```

Set a timer's duration:
```bash
curl -X POST http://localhost:8080/api/timer/{id}/set-time \
  -H "Content-Type: application/json" \
  -d '{"minutes": 10, "seconds": 0}'
```

Adjust the remaining time:
```bash
curl -X POST http://localhost:8080/api/timer/{id}/adjust-time \
  -H "Content-Type: application/json" \
  -d '{"seconds": 30}'
```

Set a timer's name:
```bash
curl -X POST http://localhost:8080/api/timer/{id}/set-name \
  -H "Content-Type: application/json" \
  -d '{"name": "Intro"}'
```

Common increments for Companion integration:

- `POST /api/timer/{id}/adjust-time` body `{ "seconds": 1 }`
- `POST /api/timer/{id}/adjust-time` body `{ "seconds": 5 }`
- `POST /api/timer/{id}/adjust-time` body `{ "seconds": 10 }`
- `POST /api/timer/{id}/adjust-time` body `{ "seconds": 15 }`
- `POST /api/timer/{id}/adjust-time` body `{ "seconds": 30 }`

#### System Operations

Get status of all timers:
```bash
curl http://localhost:8080/api/status
```

Reset all timers:
```bash
curl -X POST http://localhost:8080/api/reset
```

Get complete API documentation:
```bash
curl http://localhost:8080/api/docs
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

Each of the 5 timers maintains:
- Current time (minutes:seconds)
- Running/paused/stopped status
- Elapsed time tracking
- Initial time configuration
- Individual timer identification (1-5)

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
      "currentPauseDuration": 0,
      "initialTime": { "minutes": 8, "seconds": 0 }
    },
    {
      "id": 2,
      "minutes": 3,
      "seconds": 45,
      "isRunning": false,
      "isPaused": false,
      "elapsedMinutes": 0,
      "elapsedSeconds": 0,
      "currentPauseDuration": 0,
      "initialTime": { "minutes": 5, "seconds": 0 }
    }
  ],
  "activeTimerId": 1,
  "ntpSyncEnabled": false,
  "ntpOffset": 0,
  "serverTime": 1641234567890,
  "api_version": "2.0.0"
}
```

## Display Features

### Main Clock Display
- **Vertical Stack Layout**: All 5 timers displayed vertically, one per line
- **Large Text**: Optimized for 1920x1080 viewing
- **Timer Identification**: Simple numbers 1-5 for each timer
- **Progress Bars**: Visual representation of elapsed vs remaining time
- **Status Indicators**: Color-coded status (Running/Paused/Stopped)
- **Active Timer Highlighting**: Currently selected timer is highlighted

### Floating Clock Bar
- **All Timer Overview**: Shows all 5 timers in compact format
- **Status at a Glance**: Quick status indicators for each timer
- **Active Timer Focus**: Highlights the currently active timer
- **Always Visible**: Appears on non-display tabs for constant monitoring

### Settings Interface
- **Individual Timer Configuration**: Set unique durations for each of the 5 timers
- **Real-time Preview**: See current timer status while configuring
- **Batch Operations**: Apply settings to multiple timers
- **NTP Synchronization**: Configure network time sync settings
