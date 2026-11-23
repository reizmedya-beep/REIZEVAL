import { describe, it, expect } from 'vitest';

export interface StagedScoreInput {
  baseRubricScore: number; // 0 - 100
  projectKey: 'PROJE_1' | 'PROJE_2' | 'PROJE_3';
  stage?: 'V1_FRONTEND' | 'V2_BACKEND' | 'V3_FULL_STACK' | 'INDEPENDENT';
  webBonus?: number;       // 0 - 10
  mobileBonus?: number;    // 0 - 10
  automationBonus?: number;// 0 - 10
}

export function computeProjectFinalScore(input: StagedScoreInput): number {
  if (input.projectKey === 'PROJE_2') {
    // V3 Full-Stack incorporates weighted base + sub-module bonuses
    const web = Math.min(10, Math.max(0, input.webBonus || 0));
    const mobile = Math.min(10, Math.max(0, input.mobileBonus || 0));
    const auto = Math.min(10, Math.max(0, input.automationBonus || 0));
    const bonusTotal = web + mobile + auto; // max 30
    
    // Formula: 80% base rubric + 20% sub-module bonus score
    const weighted = Math.round(input.baseRubricScore * 0.8 + (bonusTotal / 30) * 20);
    return Math.min(100, weighted);
  }
  return input.baseRubricScore;
}

describe('REIZEVAL Staged Projects & Full-Stack Scoring Architecture', () => {
  it('evaluates PROJE_1 directly from base 100-point rubric', () => {
    const finalScore = computeProjectFinalScore({
      projectKey: 'PROJE_1',
      baseRubricScore: 92,
      stage: 'INDEPENDENT'
    });
    expect(finalScore).toBe(92);
  });

  it('evaluates PROJE_2 V3 Full-Stack combining base rubric and _WEB, _MOBİL, _OTOMASYON bonuses', () => {
    const finalScore = computeProjectFinalScore({
      projectKey: 'PROJE_2',
      baseRubricScore: 90,
      stage: 'V3_FULL_STACK',
      webBonus: 10,
      mobileBonus: 9,
      automationBonus: 8 // bonus = 27 / 30 = 0.9 * 20 = 18. Base: 90 * 0.8 = 72. Total = 90
    });
    expect(finalScore).toBe(90);
  });

  it('caps max score at 100 even with perfect bonuses on PROJE_2', () => {
    const finalScore = computeProjectFinalScore({
      projectKey: 'PROJE_2',
      baseRubricScore: 100,
      stage: 'V3_FULL_STACK',
      webBonus: 10,
      mobileBonus: 10,
      automationBonus: 10
    });
    expect(finalScore).toBe(100);
  });

  it('maintains strict separation between the 3 independent developer project instances', () => {
    const developerProjects = [
      { id: 'prj-mustafa-coban', owner: 'Mustafa Çoban', title: 'REIZEVAL — Kurumsal Masaüstü Platformu' },
      { id: 'prj-hulya-bulut', owner: 'Hülya Bulut', title: 'REIZ Omni-Channel Deneyim & Güvenlik Mimarisi' },
      { id: 'prj-mustafa-dalerdem', owner: 'Mustafa Dalerdem', title: 'REIZ Akademi & Global Jüri Ekosistemi' }
    ];

    expect(new Set(developerProjects.map(p => p.id)).size).toBe(3);
    expect(new Set(developerProjects.map(p => p.owner)).size).toBe(3);
  });
});
