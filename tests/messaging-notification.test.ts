import { describe, it, expect } from 'vitest';

export interface DirectMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  recipientJuryName: string;
  content: string;
  timestamp: string;
}

export function filterMessagesForUser(
  messages: DirectMessage[], 
  currentUserId: string, 
  currentUserRole: string,
  currentJuryName?: string
): DirectMessage[] {
  if (currentUserRole === 'GLOBAL_CTO' || currentUserRole === 'SYSTEM_ADMIN') {
    // Audit oversight
    return messages;
  }
  if (currentUserRole === 'TECHNICAL_JURY') {
    // Jury only sees messages addressed to them
    return messages.filter(m => m.recipientJuryName === currentJuryName);
  }
  // Developer only sees messages they sent or received for their project
  return messages.filter(m => m.senderId === currentUserId);
}

describe('REIZEVAL 1-on-1 Private Messaging & Notification Security', () => {
  const sampleMessages: DirectMessage[] = [
    {
      id: 'msg-1',
      projectId: 'prj-mustafa-coban',
      senderId: 'RZV-EXE-001',
      senderName: 'Mustafa Çoban',
      recipientJuryName: 'Gaspare LoDuca',
      content: 'Sayın LoDuca, V3 Full-Stack arşivini güncelledim.',
      timestamp: '10:00'
    },
    {
      id: 'msg-2',
      projectId: 'prj-hulya-bulut',
      senderId: 'RZV-EXE-002',
      senderName: 'Hülya Bulut',
      recipientJuryName: 'Olu Brown',
      content: 'Sayın Brown, _MOBİL frontend modülünü inceleyebilirsiniz.',
      timestamp: '10:15'
    }
  ];

  it('prevents Developer A (Hülya Bulut) from viewing Developer B (Mustafa Çoban) messages', () => {
    const hulyaMessages = filterMessagesForUser(sampleMessages, 'RZV-EXE-002', 'DEVELOPER');
    expect(hulyaMessages.length).toBe(1);
    expect(hulyaMessages[0].senderName).toBe('Hülya Bulut');
    expect(hulyaMessages.some(m => m.senderName === 'Mustafa Çoban')).toBe(false);
  });

  it('restricts Jury to only see messages addressed to their own name', () => {
    const gaspareMessages = filterMessagesForUser(sampleMessages, 'RZV-JURY-001', 'TECHNICAL_JURY', 'Gaspare LoDuca');
    expect(gaspareMessages.length).toBe(1);
    expect(gaspareMessages[0].recipientJuryName).toBe('Gaspare LoDuca');
    expect(gaspareMessages.some(m => m.recipientJuryName === 'Olu Brown')).toBe(false);
  });

  it('allows Global CTO (Gökçenur Öztürk) audit oversight over all platform messages', () => {
    const ctoMessages = filterMessagesForUser(sampleMessages, 'RZV-CTO-001', 'GLOBAL_CTO');
    expect(ctoMessages.length).toBe(2);
  });
});
