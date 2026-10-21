import { TaskPriority, TaskStatus } from '../types';

export const STATUS_ORDER: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'ai_executing', 'review', 'completed'];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'A fazer',
  in_progress: 'Em andamento',
  ai_executing: 'Com IA',
  review: 'Em revisão',
  completed: 'Concluído',
};

// Status is conveyed by a single small dot; everything else stays neutral.
export const STATUS_DOT: Record<TaskStatus, string> = {
  backlog: 'bg-neutral-300',
  todo: 'bg-neutral-400',
  in_progress: 'bg-blue-500',
  ai_executing: 'bg-violet-500',
  review: 'bg-amber-500',
  completed: 'bg-emerald-500',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export const formatDate = (iso: string) => {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
};
