import { app, BrowserWindow, session, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { startInternalServer, stopInternalServer } from './local-server';
import { setupIpcHandlers } from './ipc';
import { checkDesktopVersion } from './updater';

const logFile = path.join(app.getPath('userData'), 'reizeval_runtime.log');
function appLog(msg: string) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch(e){}
}

process.on('uncaughtException', (err) => {
  appLog(`UNCAUGHT EXCEPTION: ${err.stack || err}`);
});

process.on('unhandledRejection', (reason) => {
  appLog(`UNHANDLED REJECTION: ${reason}`);
});

appLog('App starting up...');

let mainWindow: BrowserWindow | null = null;
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
const CENTRAL_API_URL = process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'https://reizeval-api.onrender.com';

async function createWindow() {
  appLog('[Window] createWindow started');
  // Start or bind the internal Next.js standalone server
  const serverConfig = await startInternalServer(isDev);
  appLog(`[Server] internal server ready on ${serverConfig.url}`);

  const iconPath = path.join(process.resourcesPath, '.next', 'standalone', 'public', 'icons', 'icon.png');
  const fallbackIconPath = path.join(__dirname, '..', 'public', 'icons', 'icon.png');
  const finalIcon = require('fs').existsSync(iconPath) ? iconPath : fallbackIconPath;

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 540,
    minWidth: 800,
    minHeight: 480,
    frame: false, // Frameless for custom enterprise Windows TitleBar
    backgroundColor: '#0a1128',
    show: true,
    icon: finalIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Strict Content Security Policy (CSP) supporting Localhost, Cloud HTTPS and Tunnels
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http://127.0.0.1:* http://localhost:* ws: wss: data: blob:; connect-src 'self' https: http://127.0.0.1:* http://localhost:* ws: wss:; img-src 'self' data: blob: https: http:;"
        ],
      },
    });
  });

  // Attach internal authentication token to all loopback requests
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.startsWith('http://127.0.0.1:')) {
      details.requestHeaders['x-reizeval-internal-token'] = serverConfig.secretToken;
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  // Navigation lock: Prevent navigating away from internal Next.js
  mainWindow.webContents.on('will-navigate', (event, url) => {
    console.log(`[Will Navigate]: ${url}`);
    if (!url.startsWith(`http://127.0.0.1:${serverConfig.port}`) && !url.startsWith(`http://localhost:${serverConfig.port}`)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Open external window attempts in system default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Setup native IPC bridges
  setupIpcHandlers(mainWindow);

  // Load the App
  try {
    appLog(`[MainWindow] Loading URL: ${serverConfig.url}`);
    mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      appLog(`[WebConsole L${level}] ${message} (${sourceId}:${line})`);
    });
    mainWindow.webContents.on('did-finish-load', () => {
      appLog(`[MainWindow] did-finish-load fired`);
    });
    await mainWindow.loadURL(serverConfig.url);
    appLog(`[MainWindow] Successfully loaded URL!`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  } catch (loadErr) {
    appLog(`[MainWindow] Error loading URL: ${loadErr}`);
  }

  // Run background version check against central server (Google Drive manifest)
  if (mainWindow && !mainWindow.isDestroyed()) {
    checkDesktopVersion(CENTRAL_API_URL, mainWindow).catch((err) => appLog(`[Updater Error]: ${err}`));
  }

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    appLog(`[Renderer Gone]: reason=${details.reason}, exitCode=${details.exitCode}`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    appLog(`[Did Fail Load]: code=${errorCode}, desc=${errorDescription}, url=${validatedURL}`);
  });

  mainWindow.on('close', (e) => {
    appLog('[Window] close event fired');
  });

  mainWindow.on('closed', () => {
    appLog('[Window] closed event fired');
    mainWindow = null;
  });
}

// Ensure single instance lock on Windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  appLog('[App] Could not get single instance lock, quitting');
  app.quit();
} else {
  app.on('second-instance', () => {
    appLog('[App] Second instance event triggered');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow).catch((err) => {
    appLog(`FATAL ERROR in createWindow: ${err}`);
    dialog.showErrorBox("REIZEVAL Başlatma Hatası", err?.message || String(err));
  });

  app.on('window-all-closed', () => {
    appLog('[App] window-all-closed event fired');
    stopInternalServer();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    appLog('[App] before-quit event fired');
    stopInternalServer();
  });
}
