import React from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus } from '../types';
import { calculateUrgency } from '../utils/analytics';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_DOT, STATUS_LABEL, STATUS_ORDER, formatDate } from './status';

interface KanbanBoardProps {
  onOpenTaskModal: (taskId: string) => void;
  onOpenNewTask: (defaultStatus?: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onOpenTaskModal, onOpenNewTask }) => {
  const {
    tasks,
    teamMembers,
    updateTaskStatus,
    selectedGroupId,
    selectedProjectId,
    searchQuery,
    checkPermission,
  } = useApp();

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

  const moveTask = (e: React.MouseEvent, status: TaskStatus, taskId: string, step: 1 | -1) => {
    e.stopPropagation();
    const target = STATUS_ORDER[STATUS_ORDER.indexOf(status) + step];
    if (target) updateTaskStatus(taskId, target);
  };

  const canEdit = checkPermission('TASK_EDIT');

  return (
    <div className="px-5 md:px-10 py-6 max-w-6xl mx-auto">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map(status => {
          const colTasks = filteredTasks.filter(t => t.status === status);

          return (
            <section key={status} className="w-64 shrink-0 flex flex-col">
              <header className="group/col flex items-center gap-2 h-8 px-1 mb-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                <h2 className="text-[13px] font-medium text-neutral-900">{STATUS_LABEL[status]}</h2>
                <span className="text-[13px] text-neutral-400 tabular-nums">{colTasks.length}</span>
                {checkPermission('TASK_CREATE') && (
                  <button
                    onClick={() => onOpenNewTask(status)}
                    title="Adicionar"
                    className="ml-auto p-1 text-neutral-400 hover:text-neutral-900 rounded opacity-0 group-hover/col:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </header>

              <div className="space-y-2">
                {colTasks.map(task => {
                  const member = teamMembers.find(m => m.id === task.assignedToId);
                  const isOverdue = calculateUrgency(task.dueDate, task.status) === 'OVERDUE';

                  return (
                    <article
                      key={task.id}
                      onClick={() => onOpenTaskModal(task.id)}
                      className="group p-3 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:border-neutral-300 hover:shadow-sm transition-all"
                    >
                      <h3 className="text-[13px] text-neutral-900 leading-snug line-clamp-2">{task.title}</h3>
                      <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                        <span className="truncate">{member?.name.split(' ')[0] || '—'}</span>
                        <span className={`ml-auto tabular-nums ${isOverdue ? 'text-red-600' : ''}`}>{formatDate(task.dueDate)}</span>
                        {canEdit && (
                          <span className="hidden group-hover:flex items-center -mr-1">
                            <button onClick={(e) => moveTask(e, status, task.id, -1)} title="Voltar etapa" className="p-0.5 hover:text-neutral-900">
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => moveTask(e, status, task.id, 1)} title="Avançar etapa" className="p-0.5 hover:text-neutral-900">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
