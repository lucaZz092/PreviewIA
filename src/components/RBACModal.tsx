import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, Permission, ROLE_LABELS, DEFAULT_ROLE_PERMISSIONS } from '../utils/rbac';
import { Modal, linkButton, secondaryButton } from './Modal';

interface RBACModalProps {
  onClose: () => void;
}

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'PROJECT_CREATE', label: 'Criar grupos e projetos', group: 'Projetos' },
  { key: 'PROJECT_EDIT', label: 'Editar projetos', group: 'Projetos' },
  { key: 'PROJECT_DELETE', label: 'Excluir projetos', group: 'Projetos' },

  { key: 'TASK_CREATE', label: 'Criar tarefas', group: 'Tarefas' },
  { key: 'TASK_EDIT', label: 'Editar tarefas', group: 'Tarefas' },
  { key: 'TASK_DELETE', label: 'Excluir tarefas', group: 'Tarefas' },

  { key: 'AI_DELEGATE', label: 'Delegar tarefas a agentes', group: 'Agentes' },
  { key: 'AI_TRIGGER_RUN', label: 'Executar agentes', group: 'Agentes' },

  { key: 'AUDIT_VIEW', label: 'Ver atividade', group: 'Segurança' },
  { key: 'AUDIT_EXPORT', label: 'Exportar atividade', group: 'Segurança' },
  { key: 'SECURITY_E2EE', label: 'Gerenciar criptografia', group: 'Segurança' },
  { key: 'SECURITY_BACKUP', label: 'Gerar e restaurar backups', group: 'Segurança' },

  { key: 'PRIVACY_RETENTION', label: 'Configurar retenção de dados', group: 'Privacidade' },
  { key: 'PRIVACY_ERASE', label: 'Anonimizar dados pessoais', group: 'Privacidade' },

  { key: 'GITHUB_SYNC', label: 'Sincronizar com GitHub', group: 'Integrações' },
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
    <Modal
      size="lg"
      title="Permissões"
      onClose={onClose}
      footer={
        <>
          <span className="mr-auto text-[13px] text-neutral-500">{successMsg ? 'Salvo.' : 'Alterações são salvas automaticamente.'}</span>
          <button onClick={onClose} className={secondaryButton}>Fechar</button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6">
        <nav className="flex sm:flex-col gap-0.5 overflow-x-auto">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`h-8 px-2.5 rounded-md text-left text-[13px] whitespace-nowrap transition-colors ${
                selectedRole === r ? 'bg-neutral-100 text-neutral-900 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {ROLE_LABELS[r].label}
            </button>
          ))}
        </nav>

        <div className="space-y-6 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[13px] text-neutral-500">{ROLE_LABELS[selectedRole].description}</p>
            <div className="flex gap-4">
              <button onClick={handleResetDefaults} className={linkButton}>Restaurar padrão</button>
              {currentRole !== selectedRole && (
                <button onClick={() => setCurrentRole(selectedRole)} className={linkButton}>Visualizar como</button>
              )}
            </div>
          </div>

          {['Projetos', 'Tarefas', 'Agentes', 'Segurança', 'Privacidade', 'Integrações'].map(groupName => (
            <section key={groupName}>
              <h3 className="mb-1 text-xs text-neutral-500">{groupName}</h3>
              {ALL_PERMISSIONS.filter(p => p.group === groupName).map(perm => (
                <label key={perm.key} className="flex items-center gap-3 py-1.5 text-[13px] text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPerms.includes(perm.key)}
                    onChange={() => handleToggle(perm.key)}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  {perm.label}
                </label>
              ))}
            </section>
          ))}
        </div>
      </div>
    </Modal>
  );
};
