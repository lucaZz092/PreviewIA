import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, Permission, ROLE_LABELS, DEFAULT_ROLE_PERMISSIONS } from '../utils/rbac';
import { Shield, Check, X, RotateCcw } from 'lucide-react';

interface RBACModalProps {
  onClose: () => void;
}

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'PROJECT_CREATE', label: 'Criar Grupos & Projetos', group: 'Projetos' },
  { key: 'PROJECT_EDIT', label: 'Editar Projetos & Metas', group: 'Projetos' },
  { key: 'PROJECT_DELETE', label: 'Excluir Projetos', group: 'Projetos' },

  { key: 'TASK_CREATE', label: 'Criar Novas Demandas', group: 'Tarefas' },
  { key: 'TASK_EDIT', label: 'Editar e Movimentar Demandas', group: 'Tarefas' },
  { key: 'TASK_DELETE', label: 'Excluir Demandas Definitivamente', group: 'Tarefas' },

  { key: 'AI_DELEGATE', label: 'Delegar Demandas a Agentes de IA', group: 'Inteligência Artificial' },
  { key: 'AI_TRIGGER_RUN', label: 'Disparar Execução Autônoma de IA', group: 'Inteligência Artificial' },

  { key: 'AUDIT_VIEW', label: 'Visualizar Trilha de Auditoria', group: 'Auditoria & Segurança' },
  { key: 'AUDIT_EXPORT', label: 'Exportar Ledger e Certificados', group: 'Auditoria & Segurança' },
  { key: 'SECURITY_E2EE', label: 'Gerenciar Criptografia E2EE (AES-256)', group: 'Auditoria & Segurança' },
  { key: 'SECURITY_BACKUP', label: 'Gerar e Restaurar Backups em Nuvem', group: 'Auditoria & Segurança' },

  { key: 'PRIVACY_RETENTION', label: 'Configurar Políticas de Retenção', group: 'Privacidade (LGPD)' },
  { key: 'PRIVACY_ERASE', label: 'Anonimizar e Apagar Dados (Art. 18)', group: 'Privacidade (LGPD)' },

  { key: 'GITHUB_SYNC', label: 'Sincronizar e Integrar com GitHub', group: 'Integrações' },
];

export const RBACModal: React.FC<RBACModalProps> = ({ onClose }) => {
  const { currentRole, setCurrentRole, rolePermissions, updateRolePermissions } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const [successMsg, setSuccessMsg] = useState(false);

  const roles: Role[] = ['ADMIN', 'MANAGER', 'AI_OPERATOR', 'MEMBER', 'AUDITOR', 'GUEST'];
  const currentPerms = rolePermissions[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole];

  const handleToggle = (perm: Permission) => {
    let updated: Permission[];
    if (currentPerms.includes(perm)) {
      updated = currentPerms.filter(p => p !== perm);
    } else {
      updated = [...currentPerms, perm];
    }
    updateRolePermissions(selectedRole, updated);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  const handleResetDefaults = () => {
    updateRolePermissions(selectedRole, DEFAULT_ROLE_PERMISSIONS[selectedRole]);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Controle de Acesso Baseado em Funções (Matriz RBAC)
              </h3>
              <p className="text-[11px] text-slate-400">
                Defina permissões granulares e políticas de privilégio mínimo para a organização.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Selector Tabs */}
        <div className="flex items-center gap-2 p-4 bg-slate-950/70 border-b border-slate-800 overflow-x-auto">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRole === r
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {ROLE_LABELS[r].label}
            </button>
          ))}
        </div>

        {/* Body Matrix */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-white">{ROLE_LABELS[selectedRole].label}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {ROLE_LABELS[selectedRole].description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões</span>
              </button>
              <button
                onClick={() => setCurrentRole(selectedRole)}
                className="px-3 py-1.5 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded text-xs font-semibold hover:bg-indigo-600/50 transition-colors"
              >
                Simular este Perfil Agora
              </button>
            </div>
          </div>

          {/* Granular Permission Groups */}
          <div className="space-y-4">
            {['Projetos', 'Tarefas', 'Inteligência Artificial', 'Auditoria & Segurança', 'Privacidade (LGPD)', 'Integrações'].map(
              groupName => {
                const groupPerms = ALL_PERMISSIONS.filter(p => p.group === groupName);

                return (
                  <div
                    key={groupName}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5"
                  >
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {groupName}
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {groupPerms.map(perm => {
                        const isGranted = currentPerms.includes(perm.key);

                        return (
                          <div
                            key={perm.key}
                            onClick={() => handleToggle(perm.key)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                              isGranted
                                ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-medium">{perm.label}</span>
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                isGranted ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-600'
                              }`}
                            >
                              {isGranted && <Check className="w-3.5 h-3.5" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {successMsg ? 'Configuração atualizada com sucesso!' : 'Alterações gravadas instantaneamente.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
