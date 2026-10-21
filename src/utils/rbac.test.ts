import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission } from './rbac';

test('ADMIN has full permissions including security, LGPD and AI delegation', () => {
  assert.equal(hasPermission('ADMIN', 'PROJECT_CREATE'), true);
  assert.equal(hasPermission('ADMIN', 'PROJECT_DELETE'), true);
  assert.equal(hasPermission('ADMIN', 'AI_DELEGATE'), true);
  assert.equal(hasPermission('ADMIN', 'AI_TRIGGER_RUN'), true);
  assert.equal(hasPermission('ADMIN', 'SECURITY_E2EE'), true);
  assert.equal(hasPermission('ADMIN', 'PRIVACY_ERASE'), true);
  assert.equal(hasPermission('ADMIN', 'GITHUB_SYNC'), true);
});

test('GUEST has only read-only AUDIT_VIEW permission', () => {
  assert.equal(hasPermission('GUEST', 'AUDIT_VIEW'), true);
  assert.equal(hasPermission('GUEST', 'PROJECT_DELETE'), false);
  assert.equal(hasPermission('GUEST', 'TASK_DELETE'), false);
  assert.equal(hasPermission('GUEST', 'AI_TRIGGER_RUN'), false);
  assert.equal(hasPermission('GUEST', 'PRIVACY_ERASE'), false);
});

test('AI_OPERATOR can trigger AI runs and sync github, but cannot erase LGPD data', () => {
  assert.equal(hasPermission('AI_OPERATOR', 'AI_TRIGGER_RUN'), true);
  assert.equal(hasPermission('AI_OPERATOR', 'GITHUB_SYNC'), true);
  assert.equal(hasPermission('AI_OPERATOR', 'PRIVACY_ERASE'), false);
  assert.equal(hasPermission('AI_OPERATOR', 'PROJECT_DELETE'), false);
});
