import { ipcMain, BrowserWindow, dialog, safeStorage, Notification, app, shell } from 'electron';
import fs from 'fs';
import crypto from 'crypto';

export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  // Window State Controls (Custom Frameless TitleBar)
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  });

  ipcMain.handle('window:close', () => {
    mainWindow.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow.isMaximized();
  });

  // Native Archive File Selector (.zip & .rar)
  ipcMain.handle('dialog:selectArchive', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'REIZEVAL — Proje Arşivi Seçin',
      properties: ['openFile'],
      filters: [
        { name: 'Desteklenen Proje Arşivleri (*.zip, *.rar)', extensions: ['zip', 'rar'] },
        { name: 'ZIP Arşivi (*.zip)', extensions: ['zip'] },
        { name: 'RAR Arşivi (*.rar)', extensions: ['rar'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const stats = await fs.promises.stat(filePath);

    // Compute SHA-256 hash via chunked stream (supports 100 GB archives without memory crash)
    const sha256 = await new Promise<string>((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });

    return {
      filePath,
      fileName: filePath.split(/[\\/]/).pop() || '',
      sizeBytes: stats.size,
      sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
      sha256,
      extension: filePath.endsWith('.rar') ? 'rar' : 'zip'
    };
  });

  // Windows SafeStorage (DPAPI) for Session Tokens
  ipcMain.handle('secure:saveToken', async (_event, key: string, token: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
      return false;
    }
    const encrypted = safeStorage.encryptString(token);
    const storageDir = app.getPath('userData');
    const tokenFile = `${storageDir}/.reiz_${crypto.createHash('md5').update(key).digest('hex')}.vault`;
    await fs.promises.writeFile(tokenFile, encrypted);
    return true;
  });

  ipcMain.handle('secure:getToken', async (_event, key: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
      return null;
    }
    const storageDir = app.getPath('userData');
    const tokenFile = `${storageDir}/.reiz_${crypto.createHash('md5').update(key).digest('hex')}.vault`;
    try {
      if (fs.existsSync(tokenFile)) {
        const encrypted = await fs.promises.readFile(tokenFile);
        return safeStorage.decryptString(encrypted);
      }
    } catch (e) {
      console.error('Failed to decrypt session vault:', e);
    }
    return null;
  });

  ipcMain.handle('secure:clearToken', async (_event, key: string) => {
    const storageDir = app.getPath('userData');
    const tokenFile = `${storageDir}/.reiz_${crypto.createHash('md5').update(key).digest('hex')}.vault`;
    try {
      if (fs.existsSync(tokenFile)) {
        await fs.promises.unlink(tokenFile);
      }
      return true;
    } catch {
      return false;
    }
  });

  // Windows Native Notifications
  ipcMain.handle('notification:show', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: 'public/icons/icon.ico'
      }).show();
      return true;
    }
    return false;
  });

  // Open External Links (e.g., Google Drive update link) securely in the default browser
  ipcMain.handle('system:openExternal', async (_event, targetUrl: string) => {
    const parsed = new URL(targetUrl);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      await shell.openExternal(targetUrl);
      return true;
    }
    return false;
  });
}
