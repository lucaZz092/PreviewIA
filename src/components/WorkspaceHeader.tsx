import { useApp } from '../context/AppContext';

const taskViews = [
  { id: 'list', label: 'Lista' },
  { id: 'kanban', label: 'Quadro' },
  { id: 'gantt', label: 'Cronograma' },
] as const;

export function WorkspaceHeader() {
  const { activeView, setActiveView, projects, projectGroups, selectedProjectId, selectedGroupId } = useApp();
  if (activeView === 'agents' || activeView === 'audit') return null;

  const project = projects.find(item => item.id === selectedProjectId);
  const group = projectGroups.find(item => item.id === selectedGroupId);
  const isTaskView = activeView !== 'dashboard';
  const title = project?.name || group?.name || (isTaskView ? 'Tarefas' : 'Início');

  return (
    <section className="workspace-header px-5 md:px-10 pt-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
      {isTaskView && (
        <nav aria-label="Visualizações" className="mt-5 flex gap-6 border-b border-neutral-200">
          {taskViews.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              aria-current={activeView === id ? 'page' : undefined}
              className={`-mb-px border-b pb-2.5 text-[13px] transition-colors ${
                activeView === id ? 'border-neutral-900 text-neutral-900 font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}
