import crypto from 'crypto';

export interface CertificateMetadata {
  id: string;
  code: string;
  titleTr: string;
  titleEn: string;
  minScore: number;
  criteria: string;
  category: "WEB" | "SOFTWARE" | "AUTOMATION" | "VOLUNTEER" | "GENERAL";
}

export const REIZEVAL_CERTIFICATES: Record<string, CertificateMetadata> = {
  // 1. Proje Katılım Belgesi
  PROJECT_PARTICIPATION: {
    id: "PROJECT_PARTICIPATION",
    code: "PAR",
    titleTr: "Proje Katılım Belgesi",
    titleEn: "Certificate of Project Participation",
    minScore: 50,
    criteria: "50-59 Puan: Proje arşivlerinin eksiksiz yüklenmesi ve teknik incelemenin tamamlanması.",
    category: "GENERAL"
  },
  // 2. Proje Tamamlama Belgesi
  PROJECT_COMPLETION: {
    id: "PROJECT_COMPLETION",
    code: "CMP",
    titleTr: "Proje Tamamlama Belgesi",
    titleEn: "Certificate of Project Completion",
    minScore: 75,
    criteria: "75-84 Puan: Proje isterlerinin başarıyla yerine getirilip tamamlanması.",
    category: "GENERAL"
  },
  // 3. Teşekkür Belgesi
  APPRECIATION: {
    id: "APPRECIATION",
    code: "APP",
    titleTr: "Teşekkür Belgesi",
    titleEn: "Certificate of Appreciation",
    minScore: 65,
    criteria: "65-74 Puan: Sürece aktif katılım ve teknik ekosisteme katkı sunulması.",
    category: "GENERAL"
  },
  // 4. Takdir Belgesi
  COMMENDATION: {
    id: "COMMENDATION",
    code: "COM",
    titleTr: "Takdir Belgesi",
    titleEn: "Certificate of Commendation",
    minScore: 95,
    criteria: "95-100 Puan: Jüri değerlendirmesinde zirve A+ üstün başarı derecesi.",
    category: "GENERAL"
  },
  // 5. Gönüllü Katkı Belgesi
  VOLUNTEER_CONTRIBUTION: {
    id: "VOLUNTEER_CONTRIBUTION",
    code: "VOL",
    titleTr: "Gönüllü Katkı Belgesi",
    titleEn: "Certificate of Volunteer Contribution",
    minScore: 60,
    criteria: "60-69 Puan: Topluluk ve açık kaynak mimarilerine gönüllü destek sağlanması.",
    category: "VOLUNTEER"
  },
  // 6. Etkinlik Katılım Belgesi
  EVENT_PARTICIPATION: {
    id: "EVENT_PARTICIPATION",
    code: "EVP",
    titleTr: "Etkinlik Katılım Belgesi",
    titleEn: "Certificate of Event Participation",
    minScore: 50,
    criteria: "50+ Puan: REİZMEDYA değerlendirme etkinliklerine resmî iştirak.",
    category: "GENERAL"
  },
  // 7. Gönüllü Proje Katılım Belgesi
  VOLUNTEER_PROJECT_PARTICIPATION: {
    id: "VOLUNTEER_PROJECT_PARTICIPATION",
    code: "VPP",
    titleTr: "Gönüllü Proje Katılım Belgesi",
    titleEn: "Certificate of Volunteer Project Participation",
    minScore: 55,
    criteria: "55-64 Puan: Gönüllü proje geliştirme etabına kabul edilip arşiv sunulması.",
    category: "VOLUNTEER"
  },
  // 8. Gönüllü Proje Tamamlama Belgesi
  VOLUNTEER_PROJECT_COMPLETION: {
    id: "VOLUNTEER_PROJECT_COMPLETION",
    code: "VPC",
    titleTr: "Gönüllü Proje Tamamlama Belgesi",
    titleEn: "Certificate of Volunteer Project Completion",
    minScore: 75,
    criteria: "75-84 Puan: Gönüllü geliştirilen sistemin tüm isterlerle tamamlanması.",
    category: "VOLUNTEER"
  },
  // 9. Gönüllü Proje Geliştirme Başarı Belgesi
  VOLUNTEER_PROJECT_DEV_SUCCESS: {
    id: "VOLUNTEER_PROJECT_DEV_SUCCESS",
    code: "VDS",
    titleTr: "Gönüllü Proje Geliştirme Başarı Belgesi",
    titleEn: "Certificate of Volunteer Project Development Excellence",
    minScore: 90,
    criteria: "90-94 Puan (PROJE_2 V3 Full-Stack): Kademeli V1-V2-V3 full-stack mimaride üstün kalite.",
    category: "VOLUNTEER"
  },
  // 10. Yazılım Projesi Katılım Belgesi
  SOFTWARE_PROJECT_PARTICIPATION: {
    id: "SOFTWARE_PROJECT_PARTICIPATION",
    code: "SWP",
    titleTr: "Yazılım Projesi Katılım Belgesi",
    titleEn: "Certificate of Software Project Participation",
    minScore: 85,
    criteria: "85-89 Puan: Masaüstü veya tam teşekküllü sistem yazılımı teslimi.",
    category: "SOFTWARE"
  },
  // 11. Web Geliştirme Projesi Katılım Belgesi
  WEB_DEV_PROJECT_PARTICIPATION: {
    id: "WEB_DEV_PROJECT_PARTICIPATION",
    code: "WDP",
    titleTr: "Web Geliştirme Projesi Katılım Belgesi",
    titleEn: "Certificate of Web Development Project Participation",
    minScore: 70,
    criteria: "70+ Puan (PROJE_1): Temel Web mimarisinin başarıyla sunulması.",
    category: "WEB"
  },
  // 12. Yapay Zekâ Projesi Katkı Belgesi
  AI_PROJECT_CONTRIBUTION: {
    id: "AI_PROJECT_CONTRIBUTION",
    code: "AIC",
    titleTr: "Yapay Zekâ Projesi Katkı Belgesi",
    titleEn: "Certificate of Artificial Intelligence Project Contribution",
    minScore: 80,
    criteria: "80+ Puan: Proje içine yapay zekâ veya makine öğrenimi modelleri entegrasyonu.",
    category: "AUTOMATION"
  },
  // 13. Otomasyon Projesi Tamamlama Belgesi
  AUTOMATION_PROJECT_COMPLETION: {
    id: "AUTOMATION_PROJECT_COMPLETION",
    code: "APC",
    titleTr: "Otomasyon Projesi Tamamlama Belgesi",
    titleEn: "Certificate of Automation Project Completion",
    minScore: 70,
    criteria: "70+ Puan (PROJE_3): Python otomasyon ve bot iş akışlarının eksiksiz teslimi.",
    category: "AUTOMATION"
  }
};

/**
 * Maps exact project type and numerical score to the correct certificate among the 13 official types
 */
export function determineCertificateForProject(
  projectKey: "PROJE_1" | "PROJE_2" | "PROJE_3" | string,
  score: number,
  isV3FullStack = false
): CertificateMetadata {
  // 1. ZİRVE BAŞARI (95 - 100 PUAN)
  if (score >= 95) {
    return REIZEVAL_CERTIFICATES.COMMENDATION; // 4. Takdir Belgesi (Zirve A+ Başarı)
  }

  // 2. PROJEYE VE PUANA ÖZEL ATAMALAR
  if (projectKey === "PROJE_1" || projectKey === "PROJE_1_WEB") {
    if (score >= 70) return REIZEVAL_CERTIFICATES.WEB_DEV_PROJECT_PARTICIPATION; // 11. Web Geliştirme Belgesi
    if (score >= 60) return REIZEVAL_CERTIFICATES.PROJECT_COMPLETION;           // 2. Proje Tamamlama Belgesi
    return REIZEVAL_CERTIFICATES.PROJECT_PARTICIPATION;                         // 1. Proje Katılım Belgesi
  }

  if (projectKey === "PROJE_2" || projectKey === "PROJE_2_KADEMELI") {
    if (isV3FullStack && score >= 90) return REIZEVAL_CERTIFICATES.VOLUNTEER_PROJECT_DEV_SUCCESS; // 9. Gönüllü Proje Geliştirme Başarı Belgesi
    if (score >= 85) return REIZEVAL_CERTIFICATES.SOFTWARE_PROJECT_PARTICIPATION;                 // 10. Yazılım Projesi Katılım Belgesi
    if (score >= 75) return REIZEVAL_CERTIFICATES.VOLUNTEER_PROJECT_COMPLETION;                  // 8. Gönüllü Proje Tamamlama Belgesi
    if (score >= 65) return REIZEVAL_CERTIFICATES.VOLUNTEER_CONTRIBUTION;                        // 5. Gönüllü Katkı Belgesi
    return REIZEVAL_CERTIFICATES.VOLUNTEER_PROJECT_PARTICIPATION;                                // 7. Gönüllü Proje Katılım Belgesi
  }

  if (projectKey === "PROJE_3" || projectKey === "PROJE_3_PYTHON_OTOMASYON") {
    if (score >= 80) return REIZEVAL_CERTIFICATES.AUTOMATION_PROJECT_COMPLETION;                 // 13. Otomasyon Projesi Tamamlama Belgesi
    if (score >= 70) return REIZEVAL_CERTIFICATES.AI_PROJECT_CONTRIBUTION;                       // 12. Yapay Zekâ Projesi Katkı Belgesi
    return REIZEVAL_CERTIFICATES.PROJECT_PARTICIPATION;                                          // 1. Proje Katılım Belgesi
  }

  // Standart Puan Baremleri (Genel Projeler)
  if (score >= 85) return REIZEVAL_CERTIFICATES.SOFTWARE_PROJECT_PARTICIPATION;                   // 10
  if (score >= 75) return REIZEVAL_CERTIFICATES.PROJECT_COMPLETION;                              // 2
  if (score >= 65) return REIZEVAL_CERTIFICATES.APPRECIATION;                                    // 3
  if (score >= 55) return REIZEVAL_CERTIFICATES.EVENT_PARTICIPATION;                             // 6
  return REIZEVAL_CERTIFICATES.PROJECT_PARTICIPATION;                                            // 1
}

/**
 * Generates an unguessable certificate ID (No URL needed, purely offline cryptographic ID)
 * Format: RZV-2026-[CODE]-[RANDOM8]
 */
export function generateCertificateId(typeKey: string): string {
  const meta = REIZEVAL_CERTIFICATES[typeKey] || { code: "GEN" };
  const year = 2026;
  const randomSalt = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RZV-${year}-${meta.code}-${randomSalt}`;
}
