import test from 'node:test';
import assert from 'node:assert/strict';
import { anonymizeText, isOlderThanDays, generateDSARDossier } from './privacy';

test('anonymizeText masks emails and IP addresses according to LGPD/GDPR', () => {
  const original = 'Contact lucas.martins@preventsenior.com.br from host 192.168.1.45';
  const anonymized = anonymizeText(original);

  assert.equal(anonymized.includes('lucas.martins'), false);
  assert.equal(anonymized.includes('@'), true);
  assert.equal(anonymized.includes('192.168.***.***'), true);
});

test('isOlderThanDays checks retention threshold accurately', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  const past35Days = new Date('2026-09-15T12:00:00Z').toISOString();
  const past10Days = new Date('2026-10-10T12:00:00Z').toISOString();

  assert.equal(isOlderThanDays(past35Days, 30, now), true);
  assert.equal(isOlderThanDays(past10Days, 30, now), false);
});

test('generateDSARDossier constructs official LGPD/GDPR export', () => {
  const dossier = generateDSARDossier({
    userId: 'usr-101',
    name: 'Lucas Martins',
    email: 'lucas.martins@preventsenior.com.br',
    assignedTasksCount: 14,
    auditActionsCount: 42,
    consentGrantedAt: '2026-01-15T09:00:00Z',
  });

  assert.equal(Array.isArray(dossier.complianceFramework), true);
  assert.equal(typeof dossier.dpoContact, 'string');
  assert.equal((dossier.dataSubject as { legalName: string }).legalName, 'Lucas Martins');
});
