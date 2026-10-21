import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import { calculateUrgency } from '../utils/analytics';
import {
  Search,
  Filter,
  Bot,
  User,
  Clock,
  Lock,
  Github,
  Zap,
  Trash2,
  Edit,
  ArrowUpDown,
} from 'lucide-react';

interface ListViewProps {
  onOpenTaskModal: (taskId: string) => void;
  onOpenNewTask: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  onOpenTaskModal,
  onOpenNewTask,
}) => {
  const {
    tasks,
    projects,
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
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortField, setSortField] = useState<'dueDate' | 'priority' | 'code'>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & Sort
  const filtered = tasks
    .filter(t => {
      if (selectedGroupId && t.projectGroupId !== selectedGroupId) return false;
      if (selectedProjectId && t.projectId !== selectedProjectId) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
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
    .sort((a, b) => {
      if (sortField === 'dueDate') {
        const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return sortAsc ? diff : -diff;
      }
      if (sortField === 'code') {
        return sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      }
      const rank = { urgent: 0, high: 1, medium: 2, low: 3 };
      return sortAsc ? rank[a.priority] - rank[b.priority] : rank[b.priority] - rank[a.priority];
    });

  const toggleSort = (field: 'dueDate' | 'priority' | 'code') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Demandas da equipe</h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize as entregas, acompanhe os prazos e mantenha a equipe alinhada.
          </p>
        </div>

        {checkPermission('TASK_CREATE') && (
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <span>Nova Tarefa</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, título, descrição ou tag..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status Filter */}
          <select
            aria-label="Filtrar por status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="backlog">Backlog</option>
            <option value="todo">A Fazer</option>
            <option value="in_progress">Em Andamento</option>
            <option value="ai_executing">Execução IA</option>
            <option value="review">Em Revisão</option>
            <option value="completed">Concluído</option>
          </select>

          {/* Priority Filter */}
          <select
            aria-label="Filtrar por prioridade"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="work-table w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('code')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Código</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Demanda & Escopo</th>
                <th className="py-3 px-4">Projeto</th>
                <th className="py-3 px-4"><button onClick={() => toggleSort('priority')} className="flex items-center gap-1">Prioridade <ArrowUpDown className="w-3 h-3" /></button></th>
                <th className="py-3 px-4">Status</th>
                <th
                  onClick={() => toggleSort('dueDate')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Prazo SLA</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4 text-right">Horas (Est/Real)</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs text-slate-600">
              {filtered.map(task => {
                const project = projects.find(p => p.id === task.projectId);
                const member = teamMembers.find(m => m.id === task.assignedToId);
                const isAgent = Boolean(member?.isAI);
                const urgency = calculateUrgency(task.dueDate, task.status);

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-100/40 transition-colors group cursor-pointer"
                    onClick={() => onOpenTaskModal(task.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{task.code}</span>
                        {task.isEncrypted && (
                          <span title="E2EE AES-256">
                            <Lock className="w-3 h-3 text-amber-600" />
                          </span>
                        )}
                        {task.githubIssueNumber && (
                          <span title="GitHub Issue">
                            <Github className="w-3 h-3 text-slate-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {task.description}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {project?.name || 'Geral'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                          task.priority === 'urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : task.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {{ urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa' }[task.priority]}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        data-status={task.status}
                        disabled={!checkPermission('TASK_EDIT')}
                        aria-label={`Status de ${task.title}`}
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className={`text-xs rounded px-2 py-1 bg-slate-50 border border-slate-200 font-medium ${
                          task.status === 'completed'
                            ? 'text-emerald-600'
                            : task.status === 'ai_executing'
                            ? 'text-purple-600'
                            : 'text-slate-600'
                        }`}
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">A Fazer</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="ai_executing">Execução IA</option>
                        <option value="review">Em Revisão</option>
                        <option value="completed">Concluído</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums">
                      <span
                        className={
                          urgency === 'OVERDUE'
                            ? 'text-rose-600 font-bold'
                            : urgency === 'CRITICAL_24H'
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {task.dueDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isAgent ? (
                          <Bot className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate max-w-[130px]">
                          {member?.name || 'Não atribuído'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-right text-slate-500">
                      {task.estimatedHours}h / {task.actualHours}h
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isAgent && task.status !== 'completed' && checkPermission('AI_TRIGGER_RUN') && (
                          <button
                            onClick={() => executeAIAgentOnTask(task.id)}
                            title="Disparar Agente de IA"
                            className="p-1.5 text-purple-600 hover:text-slate-900 hover:bg-purple-50/60 rounded transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {checkPermission('TASK_DELETE') && (
                          <button
                            onClick={() => deleteTask(task.id)}
                            title="Excluir Demanda"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
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
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-500">
                    Nenhuma demanda localizada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
