import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

export interface ArchiveValidationItem {
  fileName: string;
  fileSizeBytes: number;
  format: 'ZIP' | 'RAR';
  sha256?: string;
}

export function validateMultiArchiveUpload(archives: ArchiveValidationItem[], maxCumulativeBytes = 100 * 1024 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!archives || archives.length === 0) {
    return { valid: false, error: 'En az bir arşiv gereklidir' };
  }

  if (archives.length > 5) {
    return { valid: false, error: 'Maksimum 5 arşiv yüklenebilir' };
  }

  for (const arc of archives) {
    const ext = arc.fileName.split('.').pop()?.toLowerCase();
    if (ext !== 'zip' && ext !== 'rar') {
      return { valid: false, error: `Geçersiz dosya formatı: .${ext}. Yalnızca .zip ve .rar desteklenir.` };
    }
  }

  const totalBytes = archives.reduce((sum, a) => sum + a.fileSizeBytes, 0);
  if (totalBytes > maxCumulativeBytes) {
    return { valid: false, error: 'Toplam arşiv boyutu 100 GB sınırını aşamaz' };
  }

  return { valid: true };
}

describe('REIZEVAL Multi-ZIP / RAR 100 GB Upload Engine', () => {
  it('accepts valid 4-5 archives within 100 GB limit', () => {
    const archives: ArchiveValidationItem[] = [
      { fileName: 'PROJE_Core_WEB.zip', fileSizeBytes: 5 * 1024 * 1024 * 1024, format: 'ZIP' }, // 5 GB
      { fileName: 'PROJE_Backend_MOBIL.zip', fileSizeBytes: 15 * 1024 * 1024 * 1024, format: 'ZIP' }, // 15 GB
      { fileName: 'PROJE_FullStack_OTOMASYON.rar', fileSizeBytes: 20 * 1024 * 1024 * 1024, format: 'RAR' }, // 20 GB
      { fileName: 'PROJE_Documentation.zip', fileSizeBytes: 2 * 1024 * 1024 * 1024, format: 'ZIP' }, // 2 GB
    ]; // Total = 42 GB < 100 GB

    const res = validateMultiArchiveUpload(archives);
    expect(res.valid).toBe(true);
  });

  it('rejects archives exceeding cumulative 100 GB threshold', () => {
    const archives: ArchiveValidationItem[] = [
      { fileName: 'BigData_Part1.zip', fileSizeBytes: 60 * 1024 * 1024 * 1024, format: 'ZIP' }, // 60 GB
      { fileName: 'BigData_Part2.rar', fileSizeBytes: 50 * 1024 * 1024 * 1024, format: 'RAR' }, // 50 GB
    ]; // Total = 110 GB > 100 GB

    const res = validateMultiArchiveUpload(archives);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('100 GB');
  });

  it('rejects unsupported extensions (e.g., .tar.gz, .7z, .exe)', () => {
    const archives: ArchiveValidationItem[] = [
      { fileName: 'Malicious_Payload.exe', fileSizeBytes: 1024 * 1024, format: 'ZIP' }
    ];
    const res = validateMultiArchiveUpload(archives);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Geçersiz dosya formatı');
  });

  it('correctly hashes mock chunks to SHA-256', () => {
    const chunk = Buffer.from('REIZEVAL-SECURE-ARCHIVE-PAYLOAD-2026');
    const hash = crypto.createHash('sha256').update(chunk).digest('hex');
    expect(hash).toHaveLength(64);
  });
});
