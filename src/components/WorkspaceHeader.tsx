import { CalendarDays, ChevronRight, LayoutDashboard, ListTodo, Kanban, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

const views = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'list', label: 'Quadro principal', icon: ListTodo },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'gantt', label: 'Cronograma', icon: CalendarDays },
] as const;

export function WorkspaceHeader() {
  const { activeView, setActiveView, projects, projectGroups, selectedProjectId, selectedGroupId, teamMembers, tasks } = useApp();
  const project = projects.find(item => item.id === selectedProjectId);
  const group = projectGroups.find(item => item.id === selectedGroupId);
  const scopedTasks = tasks.filter(task => (!selectedProjectId || task.projectId === selectedProjectId) && (!selectedGroupId || task.projectGroupId === selectedGroupId));
  const title = activeView === 'agents' ? 'Agentes e automações' : activeView === 'audit' ? 'Registro de atividades' : project?.name || group?.name || 'Meu espaço de trabalho';

  return (
    <section className="workspace-header px-5 pt-6 md:px-8 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <span>Workspace</span><ChevronRight size={12} /><span>{group?.name || 'Principal'}</span>
      </div>
      <div className="flex items-start justify-between gap-4 pb-5">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1.5">Um lugar para organizar projetos e fazer o trabalho acontecer.</p>
        </div>
        <div className="hidden lg:flex items-center gap-3 pt-1">
          <div className="flex -space-x-2">
            {teamMembers.filter(member => !member.isAI).slice(0, 3).map(member => (
              <span key={member.id} title={member.name} aria-label={member.name} className="relative w-8 h-8 rounded-full border-2 border-white bg-blue-100 text-blue-700 text-[10px] font-semibold flex items-center justify-center overflow-hidden">
                {member.name.split(' ').map(part => part[0]).slice(0, 2).join('')}
                <img src={member.avatar} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />
              </span>
            ))}
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1.5"><Users size={14} />{scopedTasks.length} demandas</span>
        </div>
      </div>
      <nav aria-label="Visualizações do espaço de trabalho" className="flex gap-5 overflow-x-auto">
        {views.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveView(id)} aria-current={activeView === id ? 'page' : undefined}
            className={`flex items-center gap-2 whitespace-nowrap border-b-[3px] pb-3 pt-1 text-[13px] transition-colors ${activeView === id ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </nav>
    </section>
  );
}
