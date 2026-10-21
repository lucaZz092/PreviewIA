export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'ai_executing' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectGroup {
  id: string;
  name: string;
  description: string;
  department: string;
  leadId: string;
}

export interface Project {
  id: string;
  groupId: string;
  code: string; // e.g. "OPS-01", "SEC-02"
  name: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed';
  startDate: string;
  targetDate: string;
  budgetHours: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  isAI: boolean;
  capabilities?: string[];
  status: 'available' | 'busy' | 'processing';
  activeTasksCount: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  projectId: string;
  projectGroupId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedToId: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  subtasks: Subtask[];
  githubIssueNumber?: number;
  githubPrUrl?: string;
  isEncrypted?: boolean;
  encryptedNote?: string;
  aiExecutionHistory?: {
    timestamp: string;
    agentName: string;
    log: string;
  }[];
  createdAt: string;
  completedAt?: string;
}

export interface NotificationItem {
  id: string;
  type: 'overdue' | 'due_24h' | 'due_48h' | 'ai_completed' | 'security' | 'github';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
}

export interface CloudBackupRecord {
  id: string;
  name: string;
  timestamp: string;
  sizeKb: number;
  checksum: string;
  status: 'verified' | 'pending';
}
