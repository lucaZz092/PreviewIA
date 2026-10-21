import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  CalendarDays,
  Bot,
  FileCheck2,
  FolderTree,
  FolderPlus,
  ShieldCheck,
  Github,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Lock,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  onOpenNewGroup: () => void;
  onOpenNewProject: () => void;
  onOpenGitHubModal: () => void;
  onOpenPrivacyModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewGroup,
  onOpenNewProject,
  onOpenGitHubModal,
  onOpenPrivacyModal,
}) => {
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
    currentRole,
    teamMembers,
    isLedgerValid,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useApp();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'grp-tech': true,
    'grp-compliance': true,
    'grp-operations': true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const adminMember = teamMembers.find(m => m.id === 'usr-lucas');

  const sidebarContent = (
    <aside className="w-64 md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-61px)] h-full overflow-y-auto">
      {/* Navigation Main Views */}
      <div className="p-4 border-b border-slate-800 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Visões Principais
        </p>

        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'dashboard'
              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          <span>Painel Analítico</span>
        </button>

        <button
          onClick={() => setActiveView('kanban')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'kanban'
              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Kanban className="w-4 h-4 text-emerald-400" />
          <span>Quadro de Demandas</span>
        </button>

        <button
          onClick={() => setActiveView('list')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'list'
              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <ListTodo className="w-4 h-4 text-amber-400" />
          <span>Lista Consolidada</span>
        </button>

        <button
          onClick={() => setActiveView('gantt')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'gantt'
              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-sky-400" />
          <span>Cronograma & SLAs</span>
        </button>

        <button
          onClick={() => setActiveView('agents')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'agents'
              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-400" />
          <div className="flex items-center justify-between flex-1">
            <span>Squad de Agentes IA</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
              4 Ativos
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('audit')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'audit'
              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-teal-400" />
          <div className="flex items-center justify-between flex-1">
            <span>Auditoria & SHA-256</span>
            {isLedgerValid ? (
              <span className="text-[10px] text-emerald-400 font-mono">Íntegro</span>
            ) : (
              <span className="text-[10px] text-rose-400 font-mono">Alerta</span>
            )}
          </div>
        </button>
      </div>

      {/* Project Groups & Projects Hierarchy */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Grupos & Projetos
          </p>
          {checkPermission('PROJECT_CREATE') && (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenNewGroup}
                title="Criar Novo Grupo de Projetos"
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenNewProject}
                title="Criar Novo Projeto"
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* All Projects Reset Filter */}
        <button
          onClick={() => {
            setSelectedGroupId(null);
            setSelectedProjectId(null);
          }}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
            selectedGroupId === null && selectedProjectId === null
              ? 'bg-slate-800 text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Todos os Grupos & Demandas</span>
          <span className="text-[10px] font-mono tabular-nums text-slate-400">
            {projects.length} prjs
          </span>
        </button>

        <div className="space-y-2">
          {projectGroups.map(group => {
            const groupProjects = projects.filter(p => p.groupId === group.id);
            const isExpanded = expandedGroups[group.id];
            const isGroupSelected = selectedGroupId === group.id;

            return (
              <div key={group.id} className="space-y-1">
                <div
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isGroupSelected ? 'bg-indigo-950/60 text-indigo-300' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedProjectId(null);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(group.id);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <FolderTree className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate font-medium text-xs">{group.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {groupProjects.length}
                  </span>
                </div>

                {/* Sub-projects list */}
                {isExpanded && (
                  <div className="pl-6 space-y-0.5 border-l border-slate-800 ml-3 mt-1">
                    {groupProjects.map(p => {
                      const isSelected = selectedProjectId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedGroupId(group.id);
                            setSelectedProjectId(p.id);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-medium shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] font-mono opacity-70 ml-1.5 shrink-0">
                            {p.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Governance & Security Status Badges */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>LGPD & GDPR Compliant</span>
          </div>
          <button
            onClick={onOpenPrivacyModal}
            className="text-indigo-400 hover:text-indigo-300 font-mono"
          >
            DPO
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Criptografia E2EE</span>
          </div>
          <span className="text-slate-400 font-mono">AES-256</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-slate-300" />
            <span>GitHub Sync</span>
          </div>
          <button
            onClick={onOpenGitHubModal}
            className="text-emerald-400 font-mono hover:underline"
          >
            Ativo
          </button>
        </div>

        {/* Current User Card */}
        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center gap-3">
          <img
            src={adminMember?.avatar}
            alt={adminMember?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {adminMember?.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate font-mono">
              Perfil: {currentRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 max-w-[80vw]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
