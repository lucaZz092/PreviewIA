import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface GanttViewProps {
  onOpenTaskModal: (taskId: string) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ onOpenTaskModal }) => {
  const { projects, tasks, teamMembers, projectGroups } = useApp();

  // Timeline spans roughly October 2026 - November 2026
  const timelineDays = [
    '10/10', '10/12', '10/14', '10/16', '10/18', '10/20 (Hoje)', '10/22', '10/24', '10/26', '10/28', '10/30',
    '11/05', '11/10', '11/15', '11/20', '11/30',
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Cronograma Executivo de Entregas & SLAs</h2>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhamento visual de datas críticas, dependências de projetos e metas de sprint.
        </p>
      </div>

      {/* Projects Timeline Cards */}
      <div className="space-y-6">
        {projects.map(proj => {
          const group = projectGroups.find(g => g.id === proj.groupId);
          const projTasks = tasks.filter(t => t.projectId === proj.id);
          const completedCount = projTasks.filter(t => t.status === 'completed').length;
          const progressPct = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;

          return (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm"
            >
              {/* Project Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    {proj.code}
                  </span>
                  <h3 className="text-sm font-bold text-white">{proj.name}</h3>
                  <span className="text-xs text-slate-400">· {group?.name}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-300">
                  <span>Início: {proj.startDate}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-indigo-400 font-semibold">Meta: {proj.targetDate}</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200">
                    {progressPct}% concluído
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Tasks List inside Project */}
              <div className="space-y-2 mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Entregas Mapeadas ({projTasks.length})
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {projTasks.map(t => {
                    const member = teamMembers.find(m => m.id === t.assignedToId);
                    const isCompleted = t.status === 'completed';

                    return (
                      <div
                        key={t.id}
                        onClick={() => onOpenTaskModal(t.id)}
                        className={`p-3 bg-slate-950 border rounded-lg cursor-pointer transition-colors ${
                          isCompleted
                            ? 'border-emerald-800/40 opacity-75'
                            : 'border-slate-800 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-mono text-indigo-400 font-bold">{t.code}</span>
                          <span className="font-mono text-slate-400">{t.dueDate}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-200 truncate">{t.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-900">
                          <span>{member?.name || 'Não atribuído'}</span>
                          <span className="capitalize">{t.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
