import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import net from 'net';
import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import { app } from 'electron';

function serverLog(msg: string) {
  try {
    const logFile = path.join(app.getPath('userData'), 'reizeval_runtime.log');
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch(e){}
}

export interface LocalServerConfig {
  port: number;
  secretToken: string;
  url: string;
}

let serverProcess: ChildProcess | null = null;

/**
 * Finds an available port on loopback interface 127.0.0.1
 */
function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address();
      if (!address || typeof address === 'string') {
        srv.close(() => reject(new Error('Failed to obtain ephemeral port')));
        return;
      }
      const port = address.port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

/**
 * Polls local server until it responds or timeouts
 */
function waitForServerReady(url: string, token: string, maxAttempts = 75): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (serverProcess && serverProcess.exitCode !== null) {
        clearInterval(interval);
        reject(new Error(`Next.js dahili sunucusu başlatılamadı (Çıkış Kodu: ${serverProcess.exitCode})`));
        return;
      }
      const req = http.get(url, {
        headers: { 'x-reizeval-auth': token }
      }, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          clearInterval(interval);
          resolve();
        }
      });

      req.on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Next.js standalone internal server timed out during startup'));
        }
      });
      req.end();
    }, 200);
  });
}

/**
 * Starts the internal Next.js standalone server for Electron
 */
export async function startInternalServer(isDev: boolean): Promise<LocalServerConfig> {
  const secretToken = crypto.randomBytes(32).toString('hex');

  if (isDev) {
    // In dev mode, assume 'next dev' is running on 3000
    const devPort = 3000;
    return {
      port: devPort,
      secretToken,
      url: `http://127.0.0.1:${devPort}`,
    };
  }

  const port = await findFreePort();
  const serverPath = path.join(process.resourcesPath, '.next', 'standalone', 'server.js');
  const fallbackServerPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
  
  const targetScript = require('fs').existsSync(serverPath) ? serverPath : fallbackServerPath;
  const scriptDir = path.dirname(targetScript);

  serverLog(`[Next.js Internal] Launching: ${targetScript} in ${scriptDir} on port ${port}`);

  serverProcess = spawn(process.execPath, [targetScript], {
    cwd: scriptDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: port.toString(),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
      REIZEVAL_INTERNAL_TOKEN: secretToken,
    },
    stdio: 'pipe',
  });

  serverProcess.on('error', (err) => {
    serverLog(`[Next.js Internal Spawn Error]: ${err}`);
  });

  serverProcess.stdout?.on('data', (data) => {
    serverLog(`[Next.js stdout]: ${data}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    serverLog(`[Next.js stderr]: ${data}`);
  });

  serverProcess.on('exit', (code) => {
    serverLog(`[Next.js Internal] Exited with code ${code}`);
    serverProcess = null;
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForServerReady(url, secretToken);

  return { port, secretToken, url };
}

/**
 * Gracefully shuts down the local Next.js standalone process
 */
export function stopInternalServer(): void {
  if (serverProcess && !serverProcess.killed) {
    try {
      if (process.platform === 'win32' && serverProcess.pid) {
        spawn('taskkill', ['/pid', serverProcess.pid.toString(), '/f', '/t']);
      } else {
        serverProcess.kill('SIGTERM');
      }
    } catch (err) {
      console.error('Failed to kill internal server process:', err);
    }
    serverProcess = null;
  }
}
