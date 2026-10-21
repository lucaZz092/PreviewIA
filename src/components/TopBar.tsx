import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Plus,
  FileSpreadsheet,
  Github,
  Lock,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { Role, ROLE_LABELS } from '../utils/rbac';

interface TopBarProps {
  onOpenNewTask: () => void;
  onOpenReportModal: () => void;
  onOpenGitHubModal: () => void;
  onOpenPrivacyModal: () => void;
  onOpenRBACModal: () => void;
  onOpenBackupModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenNewTask,
  onOpenReportModal,
  onOpenGitHubModal,
  onOpenPrivacyModal,
  onOpenRBACModal,
  onOpenBackupModal,
}) => {
  const {
    currentRole,
    setCurrentRole,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    checkPermission,
    teamMembers,
    activeView,
    setActiveView,
    isLedgerValid,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === 'overdue' || n.type === 'due_24h').length;
  const adminMember = teamMembers.find(m => m.id === 'usr-lucas');

  const roles: Role[] = ['ADMIN', 'MANAGER', 'AI_OPERATOR', 'MEMBER', 'AUDITOR', 'GUEST'];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      {/* Zone 1: Single text element wordmark + mobile hamburger toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Abrir menu de navegação lateral"
        >
          <Menu className="w-5 h-5" />
        </button>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('dashboard');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <span className="font-mono font-extrabold text-xs sm:text-sm">OT</span>
          </div>
          <span className="hidden sm:inline">OmniTask Enterprise</span>
          <span className="sm:hidden">OmniTask</span>
        </a>
      </div>

      {/* Zone 2: 4–5 clean single-line navigation links */}
      <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'dashboard' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          Painel Geral
        </button>
        <button
          onClick={() => setActiveView('kanban')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'kanban' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          Quadro Kanban
        </button>
        <button
          onClick={() => setActiveView('list')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'list' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          Lista de Demandas
        </button>
        <button
          onClick={() => setActiveView('gantt')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'gantt' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          Cronograma & SLAs
        </button>
        <button
          onClick={() => setActiveView('agents')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'agents' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          Squad de IA
        </button>
        <button
          onClick={() => setActiveView('audit')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'audit' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          Auditoria Criptografada
        </button>
      </nav>

      {/* Zone 3: Actions, Notifications, Role Switcher, Primary Button */}
      <div className="flex items-center gap-3 shrink-0">
        {/* GitHub Quick Sync */}
        <button
          onClick={onOpenGitHubModal}
          title="Integração GitHub Enterprise"
          aria-label="Integração GitHub Enterprise"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
        >
          <Github className="w-4 h-4" />
        </button>

        {/* Cloud Backup / E2EE Key */}
        <button
          onClick={onOpenBackupModal}
          title="Backups em Nuvem & Criptografia E2EE"
          aria-label="Backups em Nuvem & Criptografia E2EE"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Privacy & LGPD */}
        <button
          onClick={onOpenPrivacyModal}
          title="Portal de Privacidade LGPD & GDPR"
          aria-label="Portal de Privacidade LGPD & GDPR"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificações de prazos críticos"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {criticalCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Notificações Automáticas</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] text-indigo-400 font-mono tabular-nums">
                      {unreadCount} não lidas
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Limpar todas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Nenhuma notificação crítica no momento. Todas as entregas estão em conformidade.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3.5 hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        !n.read ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'overdue' && (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        {n.type === 'due_24h' && (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        {n.type === 'ai_completed' && (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {n.type === 'due_48h' && (
                          <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Matrix Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[110px]">{ROLE_LABELS[currentRole].label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-white">Simular Perfil de Acesso (RBAC)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Alterne papéis para verificar como as permissões afetam a interface.
                </p>
              </div>
              <div className="space-y-1">
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      currentRole === r
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{ROLE_LABELS[r].label}</span>
                    {currentRole === r && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 px-2">
                <button
                  onClick={() => {
                    setShowRoleSelector(false);
                    onOpenRBACModal();
                  }}
                  className="w-full text-center text-[11px] text-indigo-400 hover:text-indigo-300 py-1"
                >
                  Configurar Matriz de Permissões
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export Reports Button */}
        <button
          onClick={onOpenReportModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 whitespace-nowrap shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
          <span>Exportar</span>
        </button>

        {/* Primary CTA: Nova Demanda */}
        {checkPermission('TASK_CREATE') && (
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-md shadow-indigo-600/20 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        )}
      </div>
    </header>
  );
};
