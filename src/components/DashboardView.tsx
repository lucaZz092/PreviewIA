import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateUrgency } from '../utils/analytics';
import { STATUS_DOT, STATUS_LABEL, formatDate } from './status';

interface DashboardViewProps {
  onOpenTaskModal: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenTaskModal }) => {
  const { tasks: allTasks, teamMembers, setActiveView, selectedProjectId, selectedGroupId } = useApp();
  const tasks = allTasks.filter(task => (!selectedProjectId || task.projectId === selectedProjectId) && (!selectedGroupId || task.projectGroupId === selectedGroupId));

  const open = tasks.filter(t => t.status !== 'completed');
  const completed = tasks.length - open.length;
  const overdue = open.filter(t => calculateUrgency(t.dueDate, t.status) === 'OVERDUE').length;
  const upcoming = [...open].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);

  const stats = [
    { label: 'Em aberto', value: open.length },
    { label: 'Concluídas', value: tasks.length ? `${Math.round((completed / tasks.length) * 100)}%` : '—' },
    { label: 'Atrasadas', value: overdue, alert: overdue > 0 },
  ];

  return (
    <div className="px-5 md:px-10 py-8 max-w-6xl mx-auto space-y-12">
      <dl className="grid grid-cols-3 gap-6 max-w-xl">
        {stats.map(stat => (
          <div key={stat.label}>
            <dt className="text-[13px] text-neutral-500">{stat.label}</dt>
            <dd className={`mt-1 text-3xl font-semibold tracking-tight tabular-nums ${stat.alert ? 'text-red-600' : 'text-neutral-900'}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-medium text-neutral-900">Próximas entregas</h2>
          <button onClick={() => setActiveView('list')} className="text-[13px] text-neutral-500 hover:text-neutral-900">
            Ver todas
          </button>
        </div>

        {upcoming.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500 border-t border-neutral-100">Tudo em dia.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {upcoming.map(task => {
              const member = teamMembers.find(m => m.id === task.assignedToId);
              const isOverdue = calculateUrgency(task.dueDate, task.status) === 'OVERDUE';
              return (
                <li key={task.id}>
                  <button
                    onClick={() => onOpenTaskModal(task.id)}
                    className="w-full flex items-center gap-4 py-3 px-2 -mx-2 rounded-md text-left hover:bg-neutral-50 transition-colors"
                  >
                    <span title={STATUS_LABEL[task.status]} className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[task.status]}`} />
                    <span className="flex-1 min-w-0 truncate text-sm text-neutral-900">{task.title}</span>
                    <span className="hidden sm:block w-36 truncate text-[13px] text-neutral-500">{member?.name || '—'}</span>
                    <span className={`w-16 text-right text-[13px] tabular-nums ${isOverdue ? 'text-red-600' : 'text-neutral-500'}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
