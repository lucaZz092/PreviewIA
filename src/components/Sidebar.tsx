import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Home, ListTodo, Bot, History, ChevronRight, Plus } from 'lucide-react';

interface SidebarProps {
  onOpenNewGroup: () => void;
  onOpenNewProject: () => void;
}

const navItems = [
  { label: 'Início', icon: Home, view: 'dashboard', matches: ['dashboard'] },
  { label: 'Tarefas', icon: ListTodo, view: 'list', matches: ['list', 'kanban', 'gantt'] },
  { label: 'Agentes', icon: Bot, view: 'agents', matches: ['agents'] },
  { label: 'Atividade', icon: History, view: 'audit', matches: ['audit'] },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewGroup, onOpenNewProject }) => {
  const {
    activeView,
    setActiveView,
    projectGroups,
    projects,
    selectedGroupId,
    setSelectedGroupId,
    selectedProjectId,
    setSelectedProjectId,
    checkPermission,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useApp();

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const itemClass = (active: boolean) =>
    `w-full flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] transition-colors ${
      active ? 'bg-neutral-200/60 text-neutral-900 font-medium' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
    }`;

  // Project scope is a filter, not a page, so it gets a lighter active state than the main nav.
  const scopeClass = (active: boolean) =>
    `w-full flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] transition-colors hover:bg-neutral-100 ${
      active ? 'text-neutral-900 font-medium' : 'text-neutral-500 hover:text-neutral-900'
    }`;

  const sidebarContent = (
    <aside className="w-60 bg-neutral-50 border-r border-neutral-200 flex flex-col shrink-0 h-full overflow-y-auto">
      <nav className="p-3 space-y-0.5">
        {navItems.map(({ label, icon: Icon, view, matches }) => (
          <button
            key={view}
            onClick={() => { setMobileMenuOpen(false); setActiveView(view); }}
            className={itemClass((matches as readonly string[]).includes(activeView))}
          >
            <Icon className="w-4 h-4 text-neutral-500" strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 px-3 pb-4">
        <div className="flex items-center justify-between px-2.5 pt-4 pb-1.5">
          <span className="text-xs text-neutral-400">Projetos</span>
          {checkPermission('PROJECT_CREATE') && (
            <button
              onClick={onOpenNewProject}
              title="Novo projeto"
              className="p-0.5 text-neutral-400 hover:text-neutral-900 rounded"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setSelectedGroupId(null);
            setSelectedProjectId(null);
          }}
          className={scopeClass(selectedGroupId === null && selectedProjectId === null)}
        >
          Todos
        </button>

        {projectGroups.map(group => {
          const groupProjects = projects.filter(p => p.groupId === group.id);
          const isCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="mt-0.5">
              <div className={`${scopeClass(selectedGroupId === group.id && !selectedProjectId)} !gap-1.5`}>
                <button
                  type="button"
                  onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                  aria-label={isCollapsed ? 'Expandir' : 'Recolher'}
                  className="-ml-1 p-0.5 text-neutral-400 hover:text-neutral-900"
                >
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
                </button>
                <button
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedProjectId(null);
                  }}
                  className="flex-1 text-left truncate"
                >
                  {group.name}
                </button>
              </div>

              {!isCollapsed && (
                <div className="ml-[18px] pl-2 border-l border-neutral-200 space-y-0.5 mt-0.5">
                  {groupProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setSelectedProjectId(p.id);
                        if (!['list', 'kanban', 'gantt'].includes(activeView)) setActiveView('list');
                        setMobileMenuOpen(false);
                      }}
                      className={`${scopeClass(selectedProjectId === p.id)} !h-7`}
                    >
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {checkPermission('PROJECT_CREATE') && (
          <button onClick={onOpenNewGroup} className={`${scopeClass(false)} mt-1 !text-neutral-400 hover:!text-neutral-900`}>
            <Plus className="w-3.5 h-3.5" />
            <span>Novo grupo</span>
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:flex shrink-0">{sidebarContent}</div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 max-w-[80vw]">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
