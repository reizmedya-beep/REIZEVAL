import { app, BrowserWindow, session, shell } from 'electron';
import path from 'path';
import { startInternalServer, stopInternalServer } from './local-server';
import { setupIpcHandlers } from './ipc';
import { checkDesktopVersion } from './updater';

let mainWindow: BrowserWindow | null = null;
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
const CENTRAL_API_URL = process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'http://127.0.0.1:4000';

async function createWindow() {
  // Start or bind the internal Next.js standalone server
  const serverConfig = await startInternalServer(isDev);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Frameless for custom enterprise Windows TitleBar
    backgroundColor: '#0a1128',
    show: false,
    icon: path.join(__dirname, '..', 'public', 'icons', 'icon.ico'),
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
    if (!url.startsWith(`http://127.0.0.1:${serverConfig.port}`)) {
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
  await mainWindow.loadURL(serverConfig.url);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    // Run background version check against central server (Google Drive manifest)
    if (mainWindow) {
      checkDesktopVersion(CENTRAL_API_URL, mainWindow).catch(console.error);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure single instance lock on Windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    stopInternalServer();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    stopInternalServer();
  });
}
