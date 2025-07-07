import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import WebSocket from 'ws';
import { once } from 'events';

describe('timer set-name and set-port endpoints', () => {
  let serverProcess: ChildProcessWithoutNullStreams;
  const initialPort = 8127;
  const newPort = 8128;

  beforeEach(async () => {
    serverProcess = spawn('node', ['server.js'], {
      env: { ...process.env, PORT: String(initialPort) },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    await new Promise<void>(resolve => {
      const onData = (data: Buffer) => {
        if (data.toString().includes('Server listening')) {
          serverProcess.stdout.off('data', onData);
          resolve();
        }
      };
      serverProcess.stdout.on('data', onData);
    });
  }, 10000);

  afterEach(() => {
    serverProcess.kill();
  });

  test('set-name updates timer and broadcasts status', async () => {
    const ws = new WebSocket(`ws://localhost:${initialPort}`);
    await once(ws, 'open');

    // flush initial status
    await new Promise(res => setTimeout(res, 50));
    const messages: any[] = [];
    ws.on('message', msg => messages.push(JSON.parse(msg.toString())));

    await fetch(`http://localhost:${initialPort}/api/timer/1/set-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Custom Timer' })
    });

    await new Promise(res => setTimeout(res, 200));

    const res = await fetch(
      `http://localhost:${initialPort}/api/status?fields=timers`
    );
    const json = await res.json();

    expect(json.timers[0].name).toBe('Custom Timer');
    const actionIndex = messages.findIndex(m => m.action === 'set-name');
    const statusAfter = messages.find((m: any, i: number) => i > actionIndex && m.type === 'status');
    expect(actionIndex).not.toBe(-1);
    expect(statusAfter).toBeDefined();

    ws.close();
  });

  test('set-port changes server port and broadcasts status', async () => {
    const ws = new WebSocket(`ws://localhost:${initialPort}`);
    await once(ws, 'open');

    // flush initial status
    await new Promise(res => setTimeout(res, 50));
    const messages: any[] = [];
    ws.on('message', msg => messages.push(JSON.parse(msg.toString())));

    const resp = await fetch(`http://localhost:${initialPort}/api/set-port`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port: newPort })
    });
    expect(resp.ok).toBe(true);

    await new Promise(res => setTimeout(res, 200));

    const newWs = new WebSocket(`ws://localhost:${newPort}`);
    await once(newWs, 'open');

    const actionIndex = messages.findIndex(m => m.action === 'set-port');
    const statusAfter = messages.find((m: any, i: number) => i > actionIndex && m.type === 'status');
    expect(actionIndex).not.toBe(-1);
    expect(statusAfter).toBeDefined();

    ws.close();
    newWs.close();
  });
});
