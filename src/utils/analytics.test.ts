import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUrgency, computeProductivityMetrics, TaskItem } from './analytics';

test('calculateUrgency flags overdue and approaching tasks correctly', () => {
  const refDate = new Date('2026-10-20T12:00:00Z');

  // Overdue
  assert.equal(calculateUrgency('2026-10-18', 'todo', refDate), 'OVERDUE');
  // Critical within 24h (today)
  assert.equal(calculateUrgency('2026-10-20', 'todo', refDate), 'CRITICAL_24H');
  // Upcoming within 48h (tomorrow)
  assert.equal(calculateUrgency('2026-10-21', 'todo', refDate), 'UPCOMING_48H');
  // Nominal (in 5 days)
  assert.equal(calculateUrgency('2026-10-25', 'todo', refDate), 'NOMINAL');
  // Completed is always nominal
  assert.equal(calculateUrgency('2026-10-18', 'completed', refDate), 'NOMINAL');
});

test('computeProductivityMetrics calculates completion, AI share and workload', () => {
  const refDate = new Date('2026-10-20T12:00:00Z');
  const mockTasks: TaskItem[] = [
    {
      id: 't1',
      code: 'PRJ-1',
      title: 'Task 1',
      description: 'Desc',
      projectId: 'p1',
      projectGroupId: 'g1',
      status: 'completed',
      priority: 'high',
      dueDate: '2026-10-19',
      assignedTo: { id: 'agent-1', name: 'Sentinel AI', isAI: true, role: 'DevOps' },
      estimatedHours: 10,
      actualHours: 8,
      tags: ['infra'],
      subtasks: [{ id: 's1', title: 'Sub 1', completed: true }],
      createdAt: '2026-10-10',
    },
    {
      id: 't2',
      code: 'PRJ-2',
      title: 'Task 2',
      description: 'Desc',
      projectId: 'p1',
      projectGroupId: 'g1',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: '2026-10-20',
      assignedTo: { id: 'user-1', name: 'Lucas', isAI: false, role: 'Lead' },
      estimatedHours: 5,
      actualHours: 4,
      tags: ['backend'],
      subtasks: [],
      createdAt: '2026-10-10',
    },
  ];

  const metrics = computeProductivityMetrics(mockTasks, refDate);

  assert.equal(metrics.totalTasks, 2);
  assert.equal(metrics.completedTasks, 1);
  assert.equal(metrics.overallCompletionRate, 50);
  assert.equal(metrics.aiTaskSharePercentage, 50);
  assert.equal(metrics.totalEstimatedHours, 15);
  assert.equal(metrics.totalActualHours, 12);
  assert.equal(metrics.hoursEfficiencyDelta, 3);
  assert.equal(metrics.criticalTasks, 1);
  assert.equal(metrics.agentWorkload['agent-1'].completed, 1);
  assert.equal(metrics.agentWorkload['user-1'].inProgress, 1);
});
