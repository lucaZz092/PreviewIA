/**
 * Role-Based Access Control (RBAC) System
 * Allows intuitive permission definitions and role-swapping for testing and governance.
 */

export type Role = 'ADMIN' | 'MANAGER' | 'AI_OPERATOR' | 'MEMBER' | 'AUDITOR' | 'GUEST';

export type Permission =
  | 'PROJECT_CREATE'
  | 'PROJECT_EDIT'
  | 'PROJECT_DELETE'
  | 'TASK_CREATE'
  | 'TASK_EDIT'
  | 'TASK_DELETE'
  | 'AI_DELEGATE'
  | 'AI_TRIGGER_RUN'
  | 'AUDIT_VIEW'
  | 'AUDIT_EXPORT'
  | 'SECURITY_E2EE'
  | 'SECURITY_BACKUP'
  | 'PRIVACY_RETENTION'
  | 'PRIVACY_ERASE'
  | 'GITHUB_SYNC';

export interface RoleConfig {
  name: Role;
  label: string;
  description: string;
  permissions: Permission[];
}

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'PROJECT_CREATE',
    'PROJECT_EDIT',
    'PROJECT_DELETE',
    'TASK_CREATE',
    'TASK_EDIT',
    'TASK_DELETE',
    'AI_DELEGATE',
    'AI_TRIGGER_RUN',
    'AUDIT_VIEW',
    'AUDIT_EXPORT',
    'SECURITY_E2EE',
    'SECURITY_BACKUP',
    'PRIVACY_RETENTION',
    'PRIVACY_ERASE',
    'GITHUB_SYNC',
  ],
  MANAGER: [
    'PROJECT_CREATE',
    'PROJECT_EDIT',
    'TASK_CREATE',
    'TASK_EDIT',
    'TASK_DELETE',
    'AI_DELEGATE',
    'AI_TRIGGER_RUN',
    'AUDIT_VIEW',
    'AUDIT_EXPORT',
    'SECURITY_E2EE',
    'GITHUB_SYNC',
  ],
  AI_OPERATOR: [
    'TASK_CREATE',
    'TASK_EDIT',
    'AI_DELEGATE',
    'AI_TRIGGER_RUN',
    'AUDIT_VIEW',
    'GITHUB_SYNC',
  ],
  MEMBER: [
    'TASK_CREATE',
    'TASK_EDIT',
    'AI_DELEGATE',
    'AUDIT_VIEW',
  ],
  AUDITOR: [
    'AUDIT_VIEW',
    'AUDIT_EXPORT',
    'PRIVACY_RETENTION',
    'SECURITY_BACKUP',
  ],
  GUEST: [
    'AUDIT_VIEW',
  ],
};

export const ROLE_LABELS: Record<Role, { label: string; description: string; color: string }> = {
  ADMIN: {
    label: 'Administrador Global',
    description: 'Acesso irrestrito a configurações de segurança, auditoria, LGPD e orquestração de IA.',
    color: 'emerald',
  },
  MANAGER: {
    label: 'Gestor de Projetos',
    description: 'Criação e coordenação de projetos, fluxos de trabalho e delegação para agentes.',
    color: 'indigo',
  },
  AI_OPERATOR: {
    label: 'Operador de IA & ML',
    description: 'Supervisão de agentes autônomos, execução de rotinas e calibração de prompts.',
    color: 'amber',
  },
  MEMBER: {
    label: 'Membro da Equipe',
    description: 'Execução de demandas diárias, acompanhamento de entregas e colaboração.',
    color: 'blue',
  },
  AUDITOR: {
    label: 'Auditor de Conformidade',
    description: 'Acesso exclusivo de leitura para inspeção de integridade criptográfica e LGPD/GDPR.',
    color: 'purple',
  },
  GUEST: {
    label: 'Convidado / Visualizador',
    description: 'Visualização restrita de progresso de marcos e entregáveis.',
    color: 'slate',
  },
};

/**
 * Checks if a user role has a specific permission
 */
export function hasPermission(
  role: Role,
  permission: Permission,
  customOverrides?: Record<Role, Permission[]>
): boolean {
  const currentPermissions = customOverrides?.[role] || DEFAULT_ROLE_PERMISSIONS[role];
  return currentPermissions.includes(permission);
}
