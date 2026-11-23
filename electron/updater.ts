import { app, BrowserWindow, dialog, shell } from 'electron';
import http from 'http';
import https from 'https';

export interface VersionManifest {
  currentVersion: string;
  minSupportedVersion: string;
  driveDownloadUrl: string;
  sha256: string;
  releaseDate: string;
  changelog: string[];
}

/**
 * Checks central API for newer releases distributed via Google Drive
 */
export async function checkDesktopVersion(apiUrl: string, mainWindow: BrowserWindow): Promise<void> {
  try {
    const currentAppVersion = app.getVersion() || '1.0.0';

    const fetchManifest = (): Promise<VersionManifest | null> => {
      return new Promise((resolve) => {
        const url = `${apiUrl}/api/v1/desktop/version`;
        const client = url.startsWith('https') ? https : http;

        const req = client.get(url, { timeout: 5000 }, (res) => {
          if (res.statusCode !== 200) {
            resolve(null);
            return;
          }
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });
      });
    };

    const manifest = await fetchManifest();
    if (!manifest) return;

    const isMandatory = compareVersions(currentAppVersion, manifest.minSupportedVersion) < 0;
    const hasUpdate = compareVersions(currentAppVersion, manifest.currentVersion) < 0;

    if (hasUpdate) {
      const changelogText = (manifest.changelog && Array.isArray(manifest.changelog))
        ? manifest.changelog.map(c => `• ${c}`).join('\n')
        : '• Kararlılık ve performans iyileştirmeleri';

      const dialogResult = await dialog.showMessageBox(mainWindow, {
        type: isMandatory ? 'error' : 'info',
        title: isMandatory ? 'Zorunlu Güncelleme — REIZEVAL' : 'Yeni Sürüm Mevcut — REIZEVAL',
        message: `REIZEVAL v${manifest.currentVersion} Yayınlandı!\n\nMevcut Sürümünüz: v${currentAppVersion}\n\nDeğişiklikler:\n${changelogText}`,
        detail: isMandatory 
          ? 'Bu sürüm zorunlu bir güvenlik veya protokol güncellemesi içerir. Programı kullanmaya devam etmek için lütfen güncelleyin.'
          : 'Google Drive üzerinden güncel kurulum dosyasını (.exe) hemen indirebilirsiniz.',
        buttons: isMandatory ? ['Google Drive İndirme Bağlantısını Aç', 'Çıkış Yap'] : ['İndir', 'Daha Sonra'],
        defaultId: 0,
        cancelId: 1
      });

      if (dialogResult.response === 0) {
        await shell.openExternal(manifest.driveDownloadUrl);
      }
    }
  } catch (err) {
    console.error('[Updater] Background check skipped:', err);
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}
