/**
 * Analytics, SLA Monitoring, and Productivity KPIs
 */

export interface TaskItem {
  id: string;
  code: string; // e.g. "PRJ-101"
  title: string;
  description: string;
  projectId: string;
  projectGroupId: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'ai_executing' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string; // YYYY-MM-DD
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
    isAI: boolean;
    role: string;
  };
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  githubIssueNumber?: number;
  githubPrUrl?: string;
  isEncrypted?: boolean;
  encryptedNote?: string;
  createdAt: string;
  completedAt?: string;
}

export type UrgencyLevel = 'OVERDUE' | 'CRITICAL_24H' | 'UPCOMING_48H' | 'NOMINAL';

export function calculateUrgency(dueDateStr: string, status: TaskItem['status'], referenceDate: Date = new Date()): UrgencyLevel {
  if (status === 'completed') return 'NOMINAL';
  if (!dueDateStr) return 'NOMINAL';

  const dueTime = new Date(`${dueDateStr}T23:59:59`).getTime();
  const now = referenceDate.getTime();
  const diffHours = (dueTime - now) / (1000 * 60 * 60);

  if (diffHours < 0) return 'OVERDUE';
  if (diffHours <= 24) return 'CRITICAL_24H';
  if (diffHours <= 48) return 'UPCOMING_48H';
  return 'NOMINAL';
}

export interface ProductivityKPIs {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  aiExecutingTasks: number;
  overdueTasks: number;
  criticalTasks: number;
  overallCompletionRate: number; // percentage 0 - 100
  aiTaskSharePercentage: number; // percentage of tasks handled by AI
  totalEstimatedHours: number;
  totalActualHours: number;
  hoursEfficiencyDelta: number; // positive = saved hours
  agentWorkload: Record<string, { name: string; assigned: number; completed: number; inProgress: number; isAI: boolean }>;
}

export function computeProductivityMetrics(tasks: TaskItem[], referenceDate: Date = new Date()): ProductivityKPIs {
  const total = tasks.length;
  if (total === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      aiExecutingTasks: 0,
      overdueTasks: 0,
      criticalTasks: 0,
      overallCompletionRate: 0,
      aiTaskSharePercentage: 0,
      totalEstimatedHours: 0,
      totalActualHours: 0,
      hoursEfficiencyDelta: 0,
      agentWorkload: {},
    };
  }

  let completed = 0;
  let inProgress = 0;
  let aiExecuting = 0;
  let overdue = 0;
  let critical = 0;
  let aiHandled = 0;
  let totalEstHours = 0;
  let totalActHours = 0;

  const workload: ProductivityKPIs['agentWorkload'] = {};

  tasks.forEach((t) => {
    totalEstHours += t.estimatedHours || 0;
    totalActHours += t.actualHours || 0;

    if (t.status === 'completed') completed++;
    if (t.status === 'in_progress') inProgress++;
    if (t.status === 'ai_executing') aiExecuting++;

    if (t.assignedTo.isAI) {
      aiHandled++;
    }

    const urgency = calculateUrgency(t.dueDate, t.status, referenceDate);
    if (urgency === 'OVERDUE') overdue++;
    if (urgency === 'CRITICAL_24H') critical++;

    // Agent / Assignee workload
    const key = t.assignedTo.id;
    if (!workload[key]) {
      workload[key] = {
        name: t.assignedTo.name,
        assigned: 0,
        completed: 0,
        inProgress: 0,
        isAI: t.assignedTo.isAI,
      };
    }
    workload[key].assigned++;
    if (t.status === 'completed') workload[key].completed++;
    if (t.status === 'in_progress' || t.status === 'ai_executing') workload[key].inProgress++;
  });

  return {
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    aiExecutingTasks: aiExecuting,
    overdueTasks: overdue,
    criticalTasks: critical,
    overallCompletionRate: Math.round((completed / total) * 100),
    aiTaskSharePercentage: Math.round((aiHandled / total) * 100),
    totalEstimatedHours: totalEstHours,
    totalActualHours: totalActHours,
    hoursEfficiencyDelta: totalEstHours - totalActHours,
    agentWorkload: workload,
  };
}
