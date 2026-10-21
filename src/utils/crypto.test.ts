import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex, computeAuditHash, verifyAuditChain, AuditEntry } from './crypto';

test('sha256Hex generates consistent 64-char hex strings', async () => {
  const hash1 = await sha256Hex('omnitask-test-message');
  const hash2 = await sha256Hex('omnitask-test-message');
  const hash3 = await sha256Hex('omnitask-test-message-different');

  assert.equal(typeof hash1, 'string');
  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
});

test('verifyAuditChain validates untampered hash chain', async () => {
  const genesisPrev = 'GENESIS_BLOCK_000000000000000000000000000000000000000000000000000000000000';
  
  const entry1Base = {
    id: 'log-1',
    timestamp: '2026-10-20T10:00:00Z',
    actor: { id: 'u1', name: 'Lucas Martins', role: 'ADMIN' },
    action: 'TASK_CREATE',
    entityType: 'task' as const,
    entityId: 'PRJ-101',
    details: 'Created enterprise task',
    severity: 'low' as const,
  };
  const hash1 = await computeAuditHash(genesisPrev, entry1Base);
  const entry1: AuditEntry = { ...entry1Base, previousHash: genesisPrev, hash: hash1 };

  const entry2Base = {
    id: 'log-2',
    timestamp: '2026-10-20T10:05:00Z',
    actor: { id: 'agent-sentinel', name: 'Sentinel DevOps AI', role: 'AI_AGENT', isAI: true },
    action: 'AI_EXECUTE_SUBTASK',
    entityType: 'agent' as const,
    entityId: 'PRJ-101',
    details: 'Executed automated CI/CD security lint',
    severity: 'medium' as const,
  };
  const hash2 = await computeAuditHash(hash1, entry2Base);
  const entry2: AuditEntry = { ...entry2Base, previousHash: hash1, hash: hash2 };

  const verification = await verifyAuditChain([entry1, entry2]);
  assert.equal(verification.valid, true);
});

test('verifyAuditChain detects tampering in payload or previousHash', async () => {
  const genesisPrev = 'GENESIS_BLOCK_000000000000000000000000000000000000000000000000000000000000';
  const entry1Base = {
    id: 'log-1',
    timestamp: '2026-10-20T10:00:00Z',
    actor: { id: 'u1', name: 'Lucas Martins', role: 'ADMIN' },
    action: 'TASK_CREATE',
    entityType: 'task' as const,
    entityId: 'PRJ-101',
    details: 'Legitimate action',
    severity: 'low' as const,
  };
  const hash1 = await computeAuditHash(genesisPrev, entry1Base);
  const entry1: AuditEntry = { ...entry1Base, previousHash: genesisPrev, hash: hash1 };

  // Tampered entry with altered details without recomputing hash
  const tamperedEntry1: AuditEntry = {
    ...entry1,
    details: 'Tampered malicious change',
  };

  const verification = await verifyAuditChain([tamperedEntry1]);
  assert.equal(verification.valid, false);
  assert.equal(verification.brokenIndex, 0);
});
