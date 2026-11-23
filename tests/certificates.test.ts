import { describe, it, expect } from 'vitest';
import { REIZEVAL_CERTIFICATES, determineCertificateForProject, generateCertificateId } from '../lib/certificates';

describe('REIZEVAL 13 Official Certificate Mapping & Integrity Engine', () => {
  it('contains exactly 13 official community certificate specifications', () => {
    const keys = Object.keys(REIZEVAL_CERTIFICATES);
    expect(keys.length).toBe(13);
  });

  it('awards 4. Takdir Belgesi (COMMENDATION) for peak scores >= 95 regardless of track', () => {
    const cert1 = determineCertificateForProject('PROJE_1', 98);
    expect(cert1.id).toBe('COMMENDATION');
    expect(cert1.titleTr).toBe('Takdir Belgesi');

    const cert2 = determineCertificateForProject('PROJE_2', 96);
    expect(cert2.id).toBe('COMMENDATION');

    const cert3 = determineCertificateForProject('PROJE_3', 95);
    expect(cert3.id).toBe('COMMENDATION');
  });

  it('awards 11. Web Geliştirme Belgesi for PROJE_1 with score >= 70', () => {
    const cert = determineCertificateForProject('PROJE_1', 78);
    expect(cert.id).toBe('WEB_DEV_PROJECT_PARTICIPATION');
    expect(cert.titleTr).toBe('Web Geliştirme Projesi Katılım Belgesi');
  });

  it('awards 9. Gönüllü Proje Geliştirme Başarı Belgesi for PROJE_2 V3 Full-Stack score 90-94', () => {
    const cert = determineCertificateForProject('PROJE_2', 92, true);
    expect(cert.id).toBe('VOLUNTEER_PROJECT_DEV_SUCCESS');
    expect(cert.titleTr).toBe('Gönüllü Proje Geliştirme Başarı Belgesi');
  });

  it('awards 13. Otomasyon Projesi Tamamlama Belgesi for PROJE_3 Python Otomasyon score >= 80', () => {
    const cert = determineCertificateForProject('PROJE_3', 84);
    expect(cert.id).toBe('AUTOMATION_PROJECT_COMPLETION');
    expect(cert.titleTr).toBe('Otomasyon Projesi Tamamlama Belgesi');
  });

  it('generates offline cryptographic certificate IDs without QR or URL dependencies', () => {
    const certId = generateCertificateId('COMMENDATION');
    expect(certId).toMatch(/^RZV-2026-COM-[0-9A-F]{8}$/);
    expect(certId).not.toContain('http');
    expect(certId).not.toContain('api.reizeval.com');
  });
});
