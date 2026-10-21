import React from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_DOT, STATUS_LABEL, formatDate } from './status';

interface GanttViewProps {
  onOpenTaskModal: (taskId: string) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ onOpenTaskModal }) => {
  const { projects: allProjects, tasks, selectedProjectId, selectedGroupId } = useApp();
  const projects = allProjects.filter(project => (!selectedProjectId || project.id === selectedProjectId) && (!selectedGroupId || project.groupId === selectedGroupId));

  return (
    <div className="px-5 md:px-10 py-6 max-w-6xl mx-auto space-y-10">
      {projects.map(proj => {
        const projTasks = [...tasks.filter(t => t.projectId === proj.id)].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        const completedCount = projTasks.filter(t => t.status === 'completed').length;
        const progressPct = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;

        return (
          <section key={proj.id}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-medium text-neutral-900">{proj.name}</h2>
              <span className="text-[13px] text-neutral-500 tabular-nums">
                {formatDate(proj.startDate)} – {formatDate(proj.targetDate)} · {progressPct}%
              </span>
            </div>
            <div className="mt-2.5 h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-900 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>

            <ul className="mt-3 divide-y divide-neutral-100">
              {projTasks.map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => onOpenTaskModal(t.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md text-left hover:bg-neutral-50 transition-colors"
                  >
                    <span title={STATUS_LABEL[t.status]} className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[t.status]}`} />
                    <span className={`flex-1 min-w-0 truncate text-[13px] ${t.status === 'completed' ? 'text-neutral-400' : 'text-neutral-900'}`}>
                      {t.title}
                    </span>
                    <span className="text-[13px] text-neutral-500 tabular-nums">{formatDate(t.dueDate)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
