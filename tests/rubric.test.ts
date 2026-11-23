import { describe, it, expect } from 'vitest';

interface RubricScore {
  codeQuality: number;     // max 30
  security: number;        // max 20
  performance: number;     // max 20
  functionality: number;   // max 20
  documentation: number;   // max 10
}

function calculateTotalScore(scores: RubricScore): number {
  if (scores.codeQuality > 30 || scores.codeQuality < 0) throw new Error("Invalid Code Quality score");
  if (scores.security > 20 || scores.security < 0) throw new Error("Invalid Security score");
  if (scores.performance > 20 || scores.performance < 0) throw new Error("Invalid Performance score");
  if (scores.functionality > 20 || scores.functionality < 0) throw new Error("Invalid Functionality score");
  if (scores.documentation > 10 || scores.documentation < 0) throw new Error("Invalid Documentation score");

  return scores.codeQuality + scores.security + scores.performance + scores.functionality + scores.documentation;
}

function checkJuryDispute(scores: number[], maxAllowedVariance = 15): boolean {
  if (scores.length < 2) return false;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return (max - min) > maxAllowedVariance;
}

describe('REIZEVAL 100-Point Rubric & Variance Engine', () => {
  it('correctly calculates total score for valid inputs', () => {
    const score = calculateTotalScore({
      codeQuality: 28,
      security: 19,
      performance: 18,
      functionality: 19,
      documentation: 9,
    });
    expect(score).toBe(93);
  });

  it('rejects scores exceeding maximum criteria boundaries', () => {
    expect(() => calculateTotalScore({
      codeQuality: 35, // Exceeds max 30!
      security: 15,
      performance: 15,
      functionality: 15,
      documentation: 5,
    })).toThrow("Invalid Code Quality score");
  });

  it('flags dispute when multi-jury score variance exceeds threshold', () => {
    const juryScores = [92, 70]; // Variance = 22 > 15
    expect(checkJuryDispute(juryScores, 15)).toBe(true);
  });

  it('approves consensus when jury scores are closely aligned', () => {
    const juryScores = [88, 91, 85]; // Variance = 6 <= 15
    expect(checkJuryDispute(juryScores, 15)).toBe(false);
  });
});
