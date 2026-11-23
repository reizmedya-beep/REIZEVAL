import { describe, it, expect } from 'vitest';

export type UserRole = 'SYSTEM_ADMIN' | 'GLOBAL_CTO' | 'TECHNICAL_JURY' | 'DEVELOPER';

export interface EvaluationActionRequest {
  requesterId: string;
  requesterRole: UserRole;
  projectOwnerId: string;
}

export function authorizeJuryEvaluation(req: EvaluationActionRequest): { allowed: boolean; statusCode: number; error?: string } {
  if (req.requesterRole !== 'TECHNICAL_JURY' && req.requesterRole !== 'GLOBAL_CTO') {
    return {
      allowed: false,
      statusCode: 403,
      error: 'YETKİSİZ İŞLEM (403 Forbidden): Geliştirici veya Şirket CEOsu dahi olsa jüri puanlarına müdahale edemez veya puan veremez.'
    };
  }

  if (req.requesterId === req.projectOwnerId) {
    return {
      allowed: false,
      statusCode: 403,
      error: 'ÇIKAR ÇATIŞMASI ENGELİ (403 Forbidden): Kurucu, CEO veya adaylar kendi projelerini puanlayamazlar.'
    };
  }

  return { allowed: true, statusCode: 200 };
}

export function authorizeCtoApproval(requesterRole: UserRole): { allowed: boolean; statusCode: number; error?: string } {
  if (requesterRole !== 'GLOBAL_CTO' && requesterRole !== 'SYSTEM_ADMIN') {
    return {
      allowed: false,
      statusCode: 403,
      error: 'YETKİSİZ İŞLEM (403 Forbidden): Belge ve nihai puan onayı yalnızca Sistem Yöneticisi ve Global CTO Gökçenur Öztürk yetkisindedir.'
    };
  }
  return { allowed: true, statusCode: 200 };
}

describe('REIZEVAL Role-Based Access Control (RBAC) & Anti-Tamper Security', () => {
  it('blocks Developer (including CEO Mustafa Çoban) from submitting jury evaluations', () => {
    const result = authorizeJuryEvaluation({
      requesterId: 'RZV-EXE-001',
      requesterRole: 'DEVELOPER',
      projectOwnerId: 'RZV-EXE-002' // Even grading someone else!
    });
    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.error).toContain('YETKİSİZ İŞLEM');
  });

  it('blocks self-evaluation conflict of interest even if user has jury credentials', () => {
    const result = authorizeJuryEvaluation({
      requesterId: 'RZV-JURY-001',
      requesterRole: 'TECHNICAL_JURY',
      projectOwnerId: 'RZV-JURY-001' // Trying to grade own project!
    });
    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.error).toContain('ÇIKAR ÇATIŞMASI');
  });

  it('allows independent Technical Jury to evaluate candidate project', () => {
    const result = authorizeJuryEvaluation({
      requesterId: 'RZV-JURY-001',
      requesterRole: 'TECHNICAL_JURY',
      projectOwnerId: 'RZV-EXE-001'
    });
    expect(result.allowed).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  it('blocks Developer (including CEO) from approving evaluations or issuing certificates', () => {
    const result = authorizeCtoApproval('DEVELOPER');
    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('blocks Technical Jury from approving evaluations or issuing certificates', () => {
    const result = authorizeCtoApproval('TECHNICAL_JURY');
    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('permits Global CTO (Gökçenur Öztürk) to perform final review and approve certificates', () => {
    const result = authorizeCtoApproval('GLOBAL_CTO');
    expect(result.allowed).toBe(true);
    expect(result.statusCode).toBe(200);
  });
});
