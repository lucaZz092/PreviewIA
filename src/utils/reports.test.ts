import test from 'node:test';
import assert from 'node:assert/strict';
import { exportTasksToCSV, createBackupSnapshot } from './reports';
import { TaskItem } from './analytics';

test('exportTasksToCSV formats RFC 4180 CSV correctly with headers and escaped quotes', () => {
  const sampleTasks: TaskItem[] = [
    {
      id: 'task-1',
      code: 'DEM-001',
      title: 'Configurar "Cluster Kubernetes" de Produção',
      description: 'Setup cluster',
      projectId: 'proj-infra',
      projectGroupId: 'grp-core',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-10-25',
      assignedTo: { id: 'agent-sentinel', name: 'Sentinel AI', isAI: true, role: 'DevOps' },
      estimatedHours: 8,
      actualHours: 4,
      tags: ['k8s'],
      subtasks: [
        { id: 'sub-1', title: 'Provision nodes', completed: true },
        { id: 'sub-2', title: 'Configure TLS', completed: false },
      ],
      createdAt: '2026-10-18',
      isEncrypted: true,
    },
  ];

  const csv = exportTasksToCSV(sampleTasks);
  const lines = csv.split('\n');

  assert.equal(lines.length >= 2, true);
  assert.equal(lines[0].includes('Código'), true);
  assert.equal(lines[0].includes('Data de Entrega'), true);
  // Escaped quotes verification
  assert.equal(lines[1].includes('""Cluster Kubernetes""'), true);
  assert.equal(lines[1].includes('"Agente de IA"'), true);
  assert.equal(lines[1].includes('"SIM (AES-256)"'), true);
});

test('createBackupSnapshot includes sha256 checksum and envelope', async () => {
  const testPayload = { organization: 'OmniTask Enterprise', activeProjects: 5 };
  const snapshot = await createBackupSnapshot(testPayload);

  assert.equal(typeof snapshot.checksumSha256, 'string');
  assert.equal(snapshot.checksumSha256.length, 64);
  assert.equal(snapshot.snapshotJson.includes('checksumSha256'), true);
  assert.equal(snapshot.snapshotJson.includes('OmniTask Enterprise'), true);
});
