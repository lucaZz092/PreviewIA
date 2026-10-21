import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus } from '../types';
import { calculateUrgency } from '../utils/analytics';
import { Search, Trash2, Play } from 'lucide-react';
import { STATUS_DOT, STATUS_LABEL, STATUS_ORDER, formatDate } from './status';

interface ListViewProps {
  onOpenTaskModal: (taskId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ onOpenTaskModal }) => {
  const {
    tasks,
    teamMembers,
    updateTaskStatus,
    deleteTask,
    executeAIAgentOnTask,
    selectedGroupId,
    selectedProjectId,
    checkPermission,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = tasks
    .filter(t => {
      if (selectedGroupId && t.projectGroupId !== selectedGroupId) return false;
      if (selectedProjectId && t.projectId !== selectedProjectId) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="px-5 md:px-10 py-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 flex-1 max-w-sm h-8 px-2.5 rounded-md border border-neutral-200 focus-within:border-neutral-400 transition-colors">
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-transparent text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
        </label>
        <select
          aria-label="Filtrar por status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-8 px-2 rounded-md border border-neutral-200 bg-white text-[13px] text-neutral-600 focus:outline-none focus:border-neutral-400"
        >
          <option value="all">Todos os status</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="work-table w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500">
              <th className="py-2.5 pr-4 font-normal">Tarefa</th>
              <th className="py-2.5 px-4 font-normal w-40">Status</th>
              <th className="py-2.5 px-4 font-normal w-44">Responsável</th>
              <th className="py-2.5 px-4 font-normal w-24 text-right">Prazo</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map(task => {
              const member = teamMembers.find(m => m.id === task.assignedToId);
              const isOverdue = calculateUrgency(task.dueDate, task.status) === 'OVERDUE';

              return (
                <tr
                  key={task.id}
                  className="group cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => onOpenTaskModal(task.id)}
                >
                  <td className="py-3 pr-4 max-w-0 w-full">
                    <span className={`block truncate ${task.status === 'completed' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                      {task.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <span className="inline-flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[task.status]}`} />
                      <select
                        disabled={!checkPermission('TASK_EDIT')}
                        aria-label={`Status de ${task.title}`}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      >
                        {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-neutral-600 truncate max-w-[11rem]">
                    {member?.name || '—'}
                  </td>
                  <td className={`py-3 px-4 whitespace-nowrap text-right tabular-nums ${isOverdue ? 'text-red-600' : 'text-neutral-500'}`}>
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="py-3 pl-2 whitespace-nowrap text-right">
                    <div
                      className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {member?.isAI && task.status !== 'completed' && checkPermission('AI_TRIGGER_RUN') && (
                        <button
                          onClick={() => executeAIAgentOnTask(task.id)}
                          title="Executar agente"
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {checkPermission('TASK_DELETE') && (
                        <button
                          onClick={() => deleteTask(task.id)}
                          title="Excluir"
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-neutral-500">
                  Nenhuma tarefa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
