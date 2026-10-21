import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Plus, Menu, Check } from 'lucide-react';
import { Role, ROLE_LABELS } from '../utils/rbac';

interface TopBarProps {
  onOpenNewTask: () => void;
  onOpenReportModal: () => void;
  onOpenGitHubModal: () => void;
  onOpenPrivacyModal: () => void;
  onOpenRBACModal: () => void;
  onOpenBackupModal: () => void;
}

const roles: Role[] = ['ADMIN', 'MANAGER', 'AI_OPERATOR', 'MEMBER', 'AUDITOR', 'GUEST'];

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
    setActiveView,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useApp();

  const [openMenu, setOpenMenu] = useState<'notifications' | 'account' | null>(null);
  const toggle = (menu: 'notifications' | 'account') => setOpenMenu(openMenu === menu ? null : menu);

  const unreadCount = notifications.filter(n => !n.read).length;
  const adminMember = teamMembers.find(m => m.id === 'usr-lucas');
  const initials = (adminMember?.name || 'U').split(' ').map(part => part[0]).slice(0, 2).join('');

  const accountActions = [
    { label: 'Exportar relatório', onClick: onOpenReportModal },
    { label: 'Integração GitHub', onClick: onOpenGitHubModal },
    { label: 'Backup e criptografia', onClick: onOpenBackupModal },
    { label: 'Privacidade', onClick: onOpenPrivacyModal },
    { label: 'Permissões', onClick: onOpenRBACModal },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 px-4 sm:px-5 bg-white border-b border-neutral-200">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden -ml-1 p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('dashboard');
          }}
          className="text-[15px] font-semibold tracking-tight text-neutral-900"
        >
          OmniTask
        </a>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => toggle('notifications')}
            aria-label="Notificações"
            className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>

          {openMenu === 'notifications' && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <span className="text-sm font-medium text-neutral-900">Notificações</span>
                {notifications.length > 0 && (
                  <button onClick={clearAllNotifications} className="text-xs text-neutral-500 hover:text-neutral-900">
                    Limpar
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-sm text-neutral-500">Nada por aqui.</p>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className="w-full text-left flex gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                    >
                      <span className={`mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-red-500'}`} />
                      <span className="min-w-0">
                        <span className="block text-sm text-neutral-900 truncate">{n.title}</span>
                        <span className="block text-xs text-neutral-500 mt-0.5">{n.message}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {checkPermission('TASK_CREATE') && (
          <button
            onClick={onOpenNewTask}
            aria-label="Nova tarefa"
            className="ml-1 flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium text-white bg-neutral-900 hover:bg-neutral-700 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova tarefa</span>
          </button>
        )}

        <div className="relative ml-2">
          <button
            onClick={() => toggle('account')}
            aria-label="Conta e configurações"
            className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-100 text-[11px] font-medium text-neutral-600 flex items-center justify-center ring-offset-2 hover:ring-2 hover:ring-neutral-200"
          >
            {initials}
            {adminMember?.avatar && (
              <img
                src={adminMember.avatar}
                alt=""
                onError={event => { event.currentTarget.style.display = 'none'; }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </button>

          {openMenu === 'account' && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1.5 text-sm">
              <div className="px-3 py-2">
                <p className="font-medium text-neutral-900 truncate">{adminMember?.name}</p>
                <p className="text-xs text-neutral-500">{ROLE_LABELS[currentRole].label}</p>
              </div>
              <div className="my-1.5 border-t border-neutral-100" />
              {accountActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => {
                    setOpenMenu(null);
                    action.onClick();
                  }}
                  className="w-full text-left px-3 py-1.5 text-neutral-700 hover:bg-neutral-50"
                >
                  {action.label}
                </button>
              ))}
              <div className="my-1.5 border-t border-neutral-100" />
              <p className="px-3 pt-1 pb-1 text-xs text-neutral-400">Visualizar como</p>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-neutral-700 hover:bg-neutral-50"
                >
                  <span>{ROLE_LABELS[r].label}</span>
                  {currentRole === r && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {openMenu && <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />}
    </header>
  );
};
