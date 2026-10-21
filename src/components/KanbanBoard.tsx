import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { calculateUrgency } from '../utils/analytics';
import {
  Plus,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Github,
  Lock,
  Zap,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface KanbanBoardProps {
  onOpenTaskModal: (taskId: string) => void;
  onOpenNewTask: (defaultStatus?: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; border: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'text-slate-400', border: 'border-slate-800' },
  { id: 'todo', label: 'A Fazer', color: 'text-blue-400', border: 'border-blue-900/50' },
  { id: 'in_progress', label: 'Em Andamento', color: 'text-indigo-400', border: 'border-indigo-900/50' },
  { id: 'ai_executing', label: 'Execução IA', color: 'text-purple-400', border: 'border-purple-900/50' },
  { id: 'review', label: 'Em Revisão', color: 'text-amber-400', border: 'border-amber-900/50' },
  { id: 'completed', label: 'Concluído', color: 'text-emerald-400', border: 'border-emerald-900/50' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onOpenTaskModal,
  onOpenNewTask,
}) => {
  const {
    tasks,
    teamMembers,
    updateTaskStatus,
    executeAIAgentOnTask,
    selectedGroupId,
    selectedProjectId,
    searchQuery,
    checkPermission,
  } = useApp();

  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedGroupId && t.projectGroupId !== selectedGroupId) return false;
    if (selectedProjectId && t.projectId !== selectedProjectId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRunAgent = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setExecutingTaskId(taskId);
    await executeAIAgentOnTask(taskId);
    setExecutingTaskId(null);
  };

  const moveTask = (e: React.MouseEvent, taskId: string, direction: 'prev' | 'next') => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentIndex = COLUMNS.findIndex(c => c.id === task.status);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < COLUMNS.length) {
      updateTaskStatus(taskId, COLUMNS[targetIndex].id);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-61px)] flex flex-col overflow-hidden">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between pb-4 mb-2 shrink-0 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Quadro Kanban de Demandas</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitore o ciclo de vida, arraste ou avance estados e delegue para IA autônoma em tempo
            real.
          </p>
        </div>

        {checkPermission('TASK_CREATE') && (
          <button
            onClick={() => onOpenNewTask()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Tarefa</span>
          </button>
        )}
      </div>

      {/* 6 Kanban Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto overflow-y-hidden pb-2 min-w-[1100px]">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden"
            >
              {/* Column Header */}
              <div className={`p-3 border-b ${col.border} flex items-center justify-between shrink-0 bg-slate-900/90`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                {checkPermission('TASK_CREATE') && (
                  <button
                    onClick={() => onOpenNewTask(col.id)}
                    title={`Adicionar em ${col.label}`}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Column Task Cards Scroll Container */}
              <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
                {colTasks.map(task => {
                  const member = teamMembers.find(m => m.id === task.assignedToId);
                  const isAgent = Boolean(member?.isAI);
                  const urgency = calculateUrgency(task.dueDate, task.status);
                  const completedSubs = task.subtasks.filter(s => s.completed).length;
                  const totalSubs = task.subtasks.length;
                  const isExecuting = executingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskModal(task.id)}
                      className={`p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-lg cursor-pointer transition-all shadow-sm group hover:shadow-indigo-500/10 ${
                        task.status === 'ai_executing' ? 'border-purple-500/50 bg-purple-950/20' : ''
                      }`}
                    >
                      {/* Top tags and priority */}
                      <div className="flex items-center justify-between gap-1 text-[10px] mb-1.5">
                        <span className="font-mono font-bold text-indigo-400">{task.code}</span>
                        <div className="flex items-center gap-1.5">
                          {task.isEncrypted && (
                            <span title="Protegido por E2EE (AES-256)">
                              <Lock className="w-3 h-3 text-amber-400" />
                            </span>
                          )}
                          {task.githubIssueNumber && (
                            <span
                              title={`Vinculado à Issue #${task.githubIssueNumber} do GitHub`}
                              className="text-slate-400"
                            >
                              <Github className="w-3 h-3" />
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded font-medium ${
                              task.priority === 'urgent'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                : task.priority === 'high'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-relaxed">
                        {task.title}
                      </h4>

                      {/* Subtasks Progress */}
                      {totalSubs > 0 && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>Checklist</span>
                            <span className="font-mono tabular-nums">
                              {completedSubs}/{totalSubs}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all"
                              style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Due date urgency indicator */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-900">
                        <div
                          className={`flex items-center gap-1 font-mono text-[10px] ${
                            urgency === 'OVERDUE'
                              ? 'text-rose-400 font-bold'
                              : urgency === 'CRITICAL_24H'
                              ? 'text-amber-400 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{task.dueDate}</span>
                        </div>

                        {/* Assignee */}
                        <div className="flex items-center gap-1.5">
                          {isAgent ? (
                            <div className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-800/50">
                              <Bot className="w-3 h-3 text-purple-400" />
                              <span className="truncate max-w-[70px]">{member?.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[70px]">{member?.name.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick AI Trigger button on card if assigned to AI and not completed */}
                      {isAgent && task.status !== 'completed' && checkPermission('AI_TRIGGER_RUN') && (
                        <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between">
                          <button
                            onClick={(e) => handleRunAgent(e, task.id)}
                            disabled={isExecuting}
                            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[10px] font-semibold text-purple-300 bg-purple-950/80 hover:bg-purple-900/90 border border-purple-700/50 rounded transition-colors"
                          >
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span>{isExecuting ? 'Executando...' : 'Disparar Agente IA'}</span>
                          </button>
                        </div>
                      )}

                      {/* Quick stage advance buttons */}
                      <div className="mt-2 pt-1 flex items-center justify-between text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => moveTask(e, task.id, 'prev')}
                          title="Mover para coluna anterior"
                          className="hover:text-white p-0.5"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] uppercase font-mono text-slate-400">Avançar</span>
                        <button
                          onClick={(e) => moveTask(e, task.id, 'next')}
                          title="Avançar para próxima coluna"
                          className="hover:text-white p-0.5"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
