import { contextBridge, ipcRenderer } from 'electron';

export interface ArchiveSelectionResult {
  filePath: string;
  fileName: string;
  sizeBytes: number;
  sizeFormatted: string;
  sha256: string;
  extension: 'zip' | 'rar';
}

const reizevalNativeAPI = {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Native File Dialog
  selectArchive: (): Promise<ArchiveSelectionResult | null> => ipcRenderer.invoke('dialog:selectArchive'),

  // Secure OS Token Storage
  saveSecureToken: (key: string, token: string): Promise<boolean> => 
    ipcRenderer.invoke('secure:saveToken', key, token),
  getSecureToken: (key: string): Promise<string | null> => 
    ipcRenderer.invoke('secure:getToken', key),
  clearSecureToken: (key: string): Promise<boolean> => 
    ipcRenderer.invoke('secure:clearToken', key),

  // Native Notifications
  showNotification: (title: string, body: string): Promise<boolean> => 
    ipcRenderer.invoke('notification:show', title, body),

  // External Links (Google Drive download etc.)
  openExternal: (url: string): Promise<boolean> => 
    ipcRenderer.invoke('system:openExternal', url),

  // Platform info
  platform: process.platform,
};

contextBridge.exposeInMainWorld('reizevalNative', reizevalNativeAPI);

export type ReizevalNativeAPI = typeof reizevalNativeAPI;
