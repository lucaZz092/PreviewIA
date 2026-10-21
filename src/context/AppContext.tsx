import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  Project,
  ProjectGroup,
  TeamMember,
  NotificationItem,
  CloudBackupRecord,
  TaskStatus,
} from '../types';
import { Role, Permission, hasPermission, DEFAULT_ROLE_PERMISSIONS } from '../utils/rbac';
import { AuditEntry, computeAuditHash, verifyAuditChain, encryptE2EE, decryptE2EE } from '../utils/crypto';
import { RetentionPolicy, DEFAULT_RETENTION_POLICIES, anonymizeText } from '../utils/privacy';
import { calculateUrgency } from '../utils/analytics';

// Generated assets
import avatarAdminImg from '../assets/images/avatar_user_admin_1792545544122.jpg';
import avatarSentinelImg from '../assets/images/avatar_agent_sentinel_1792545543254.jpg';
import avatarAnalystImg from '../assets/images/avatar_agent_analyst_1792545544159.jpg';

interface AppContextType {
  // Navigation & Role
  activeView: 'dashboard' | 'kanban' | 'list' | 'gantt' | 'agents' | 'audit';
  setActiveView: (view: 'dashboard' | 'kanban' | 'list' | 'gantt' | 'agents' | 'audit') => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  checkPermission: (perm: Permission) => boolean;
  rolePermissions: Record<Role, Permission[]>;
  updateRolePermissions: (role: Role, perms: Permission[]) => void;

  // Filters & State
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data
  projectGroups: ProjectGroup[];
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  auditLogs: AuditEntry[];
  notifications: NotificationItem[];
  retentionPolicies: RetentionPolicy[];
  cloudBackups: CloudBackupRecord[];

  // Mutators
  createTask: (task: Omit<Task, 'id' | 'code' | 'createdAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  executeAIAgentOnTask: (taskId: string) => Promise<{ success: boolean; log: string }>;

  createProject: (project: Omit<Project, 'id'>) => Promise<void>;
  createProjectGroup: (group: Omit<ProjectGroup, 'id'>) => Promise<void>;

  // Security & Audit
  e2eeSecretKey: string;
  setE2EESecretKey: (key: string) => void;
  verifyLedgerIntegrity: () => Promise<{ valid: boolean; brokenIndex?: number; reason?: string }>;
  isLedgerValid: boolean;

  // Privacy & LGPD
  runRetentionPolicy: (policyId: string) => Promise<{ affectedCount: number }>;
  anonymizeUserData: (email: string) => Promise<void>;

  // Backup & GitHub
  triggerCloudBackup: () => Promise<CloudBackupRecord>;
  syncWithGitHub: (taskId?: string) => Promise<void>;
  githubRepoName: string;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Mobile drawer state
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_GROUPS: ProjectGroup[] = [
  {
    id: 'grp-tech',
    name: 'Engenharia de Plataforma & IA',
    description: 'Arquitetura de microsserviços, orquestração de IA e segurança em nuvem.',
    department: 'Tecnologia da Informação',
    leadId: 'usr-lucas',
  },
  {
    id: 'grp-compliance',
    name: 'Governança & Privacidade de Dados',
    description: 'Adequação contínua LGPD/GDPR, auditorias de segurança e controles de acesso.',
    department: 'Jurídico & Compliance',
    leadId: 'usr-lucas',
  },
  {
    id: 'grp-operations',
    name: 'Operações Corporativas & Eficiência',
    description: 'Automação de processos internos, SLAs de atendimento e telemetria de produtividade.',
    department: 'Operações',
    leadId: 'usr-camila',
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-cloud',
    groupId: 'grp-tech',
    code: 'PLT-01',
    name: 'Cluster Kubernetes & CI/CD Seguro',
    description: 'Modernização de infraestrutura com orquestração de contêineres e SAST automatizado.',
    status: 'active',
    startDate: '2026-10-01',
    targetDate: '2026-11-15',
    budgetHours: 240,
  },
  {
    id: 'prj-privacy',
    groupId: 'grp-compliance',
    code: 'GOV-02',
    name: 'Certificação LGPD & Criptografia E2EE',
    description: 'Implementação de logs com hash-chaining, direito ao esquecimento e chaves AES-256.',
    status: 'active',
    startDate: '2026-10-05',
    targetDate: '2026-10-28',
    budgetHours: 160,
  },
  {
    id: 'prj-ai-ops',
    groupId: 'grp-tech',
    code: 'AGI-03',
    name: 'Squad Autônomo de Agentes de IA',
    description: 'Delegação e supervisão em tempo real de demandas técnicas para agentes inteligentes.',
    status: 'active',
    startDate: '2026-10-10',
    targetDate: '2026-11-30',
    budgetHours: 320,
  },
];

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'usr-lucas',
    name: 'Lucas Martins',
    role: 'Tech Lead & Administrador',
    email: 'lucas.martins@preventsenior.com.br',
    avatar: avatarAdminImg,
    isAI: false,
    status: 'available',
    activeTasksCount: 3,
  },
  {
    id: 'usr-camila',
    name: 'Dra. Camila Duarte',
    role: 'Gestora de Compliance & DPO',
    email: 'camila.duarte@empresa.com.br',
    avatar: '',
    isAI: false,
    status: 'available',
    activeTasksCount: 2,
  },
  {
    id: 'usr-rodrigo',
    name: 'Rodrigo Souza',
    role: 'Engenheiro de Software Sênior',
    email: 'rodrigo.souza@empresa.com.br',
    avatar: '',
    isAI: false,
    status: 'busy',
    activeTasksCount: 4,
  },
  // Specialized AI Agents
  {
    id: 'agent-sentinel',
    name: 'Sentinel DevOps AI',
    role: 'Agente de Infraestrutura & CI/CD',
    email: 'sentinel.bot@internal.ai',
    avatar: avatarSentinelImg,
    isAI: true,
    capabilities: ['Kubernetes', 'CI/CD Pipelines', 'SAST Vulnerability Scan', 'Docker Security'],
    status: 'available',
    activeTasksCount: 2,
  },
  {
    id: 'agent-nexus',
    name: 'Nexus Data Synthesizer',
    role: 'Agente de Análise & Prazos Críticos',
    email: 'nexus.bot@internal.ai',
    avatar: avatarAnalystImg,
    isAI: true,
    capabilities: ['SLA Prediction', 'Productivity Metrics', 'Bottleneck Detection', 'Executive Reports'],
    status: 'available',
    activeTasksCount: 1,
  },
  {
    id: 'agent-lex',
    name: 'Lex SecOps & LGPD Auditor',
    role: 'Agente de Conformidade & Privacidade',
    email: 'lex.auditor@internal.ai',
    avatar: '',
    isAI: true,
    capabilities: ['LGPD Art. 18 / GDPR Art. 17', 'Audit Chain Validation', 'DSAR Export', 'Retention Schedules'],
    status: 'available',
    activeTasksCount: 2,
  },
  {
    id: 'agent-apollo',
    name: 'Apollo Code Reviewer',
    role: 'Agente de Revisão e Qualidade',
    email: 'apollo.review@internal.ai',
    avatar: '',
    isAI: true,
    capabilities: ['TypeScript / Go / Python Review', 'Clean Architecture', 'Unit Test Generation'],
    status: 'available',
    activeTasksCount: 1,
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-101',
    code: 'PLT-101',
    title: 'Auditoria de Políticas de Acesso RBAC em Kubernetes',
    description: 'Revisar ServiceAccounts, ClusterRoles e garantir princípio de menor privilégio nos clusters.',
    projectId: 'prj-cloud',
    projectGroupId: 'grp-tech',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-10-21', // Critical in 24h
    assignedToId: 'agent-sentinel',
    estimatedHours: 12,
    actualHours: 8,
    tags: ['k8s', 'security', 'rbac'],
    subtasks: [
      { id: 'sub-1', title: 'Exportar matriz RBAC atual', completed: true },
      { id: 'sub-2', title: 'Identificar privilégios wildcard (*)', completed: true },
      { id: 'sub-3', title: 'Aplicar NetworkPolicies restritivas', completed: false },
    ],
    githubIssueNumber: 42,
    githubPrUrl: 'https://github.com/preventsenior-enterprise/core-platform-services/pull/42',
    isEncrypted: false,
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'tsk-102',
    code: 'GOV-102',
    title: 'Mapeamento de Fluxos de Dados Pessoais Sensíveis (RIPD)',
    description: 'Documentar bases legais e ciclo de vida de dados para total conformidade com a LGPD e GDPR.',
    projectId: 'prj-privacy',
    projectGroupId: 'grp-compliance',
    status: 'ai_executing',
    priority: 'urgent',
    dueDate: '2026-10-20', // Due Today / Urgent
    assignedToId: 'agent-lex',
    estimatedHours: 20,
    actualHours: 16,
    tags: ['lgpd', 'compliance', 'dpo'],
    subtasks: [
      { id: 'sub-4', title: 'Mapear tabelas com campos de identificação', completed: true },
      { id: 'sub-5', title: 'Validar consentimento e política de retenção', completed: true },
      { id: 'sub-6', title: 'Emitir relatório assinado digitalmente', completed: false },
    ],
    isEncrypted: true,
    encryptedNote: 'E2EE_AES256:dGVzdGUtY3JpcHRvZ3JhZmlhLWxncGQtY29uZmVuY2lhbA==',
    createdAt: '2026-10-12T14:30:00Z',
  },
  {
    id: 'tsk-103',
    code: 'AGI-103',
    title: 'Otimização de Throughput e Análise de Gargalos na Entrega',
    description: 'Calcular velocidade do sprint, tempo médio de resolução e distribuição de carga entre humanos e IAs.',
    projectId: 'prj-ai-ops',
    projectGroupId: 'grp-tech',
    status: 'review',
    priority: 'medium',
    dueDate: '2026-10-24',
    assignedToId: 'agent-nexus',
    estimatedHours: 8,
    actualHours: 6,
    tags: ['analytics', 'velocity', 'kpi'],
    subtasks: [
      { id: 'sub-7', title: 'Consolidar métricas de ciclo', completed: true },
      { id: 'sub-8', title: 'Gerar gráficos de velocidade', completed: true },
    ],
    createdAt: '2026-10-16T11:00:00Z',
  },
  {
    id: 'tsk-104',
    code: 'PLT-104',
    title: 'Configurar Webhooks e CI/CD com GitHub Enterprise',
    description: 'Integrar repositórios para sincronização automática de issues, branches e validação de commits.',
    projectId: 'prj-cloud',
    projectGroupId: 'grp-tech',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-10-18', // Past date, completed
    assignedToId: 'usr-lucas',
    estimatedHours: 16,
    actualHours: 14,
    tags: ['github', 'cicd', 'automation'],
    subtasks: [
      { id: 'sub-9', title: 'Configurar Webhook Secret', completed: true },
      { id: 'sub-10', title: 'Criar Actions workflow de verificação', completed: true },
    ],
    githubIssueNumber: 15,
    githubPrUrl: 'https://github.com/preventsenior-enterprise/core-platform-services/pull/15',
    createdAt: '2026-10-10T08:00:00Z',
    completedAt: '2026-10-18T17:00:00Z',
  },
  {
    id: 'tsk-105',
    code: 'GOV-105',
    title: 'Agendamento de Política de Retenção Automática de Logs',
    description: 'Impedir acúmulo desnecessário de telemetria após 90 dias com eliminação auditada.',
    projectId: 'prj-privacy',
    projectGroupId: 'grp-compliance',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-28',
    assignedToId: 'usr-camila',
    estimatedHours: 6,
    actualHours: 0,
    tags: ['retention', 'privacy'],
    subtasks: [
      { id: 'sub-11', title: 'Definir janelas de retenção', completed: false },
      { id: 'sub-12', title: 'Testar cron de expurgo sem quebrar hash chain', completed: false },
    ],
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'tsk-106',
    code: 'AGI-106',
    title: 'Revisão Automatizada de Pull Requests com Agente Apollo',
    description: 'Implementar bot de comentários com sugestões de segurança e lint de boas práticas.',
    projectId: 'prj-ai-ops',
    projectGroupId: 'grp-tech',
    status: 'backlog',
    priority: 'low',
    dueDate: '2026-11-05',
    assignedToId: 'agent-apollo',
    estimatedHours: 14,
    actualHours: 0,
    tags: ['ai', 'code-review', 'github'],
    subtasks: [
      { id: 'sub-13', title: 'Estruturar prompts de auditoria', completed: false },
    ],
    createdAt: '2026-10-19T15:00:00Z',
  },
];

const GENESIS_HASH = 'GENESIS_BLOCK_000000000000000000000000000000000000000000000000000000000000';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<'dashboard' | 'kanban' | 'list' | 'gantt' | 'agents' | 'audit'>('dashboard');
  const [currentRole, setCurrentRole] = useState<Role>('ADMIN');
  const [rolePermissions, setRolePermissions] = useState<Record<Role, Permission[]>>(DEFAULT_ROLE_PERMISSIONS);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>(INITIAL_GROUPS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [teamMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(DEFAULT_RETENTION_POLICIES);
  const [e2eeSecretKey, setE2EESecretKey] = useState<string>('OmniSecretKey2026EnterpriseSafe');

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isLedgerValid, setIsLedgerValid] = useState<boolean>(true);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cloudBackups, setCloudBackups] = useState<CloudBackupRecord[]>([
    {
      id: 'BCK-20261020-01',
      name: 'Backup Completo Criptografado (Diário)',
      timestamp: '2026-10-20T03:00:00Z',
      sizeKb: 342,
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'verified',
    },
  ]);

  // Permission checker helper
  const checkPermission = useCallback(
    (perm: Permission) => hasPermission(currentRole, perm, rolePermissions),
    [currentRole, rolePermissions]
  );

  const updateRolePermissions = (role: Role, perms: Permission[]) => {
    setRolePermissions(prev => ({ ...prev, [role]: perms }));
  };

  // Append entry to cryptographic audit chain
  const appendAuditLog = useCallback(
    async (
      action: string,
      entityType: AuditEntry['entityType'],
      entityId: string,
      details: string,
      severity: AuditEntry['severity'] = 'low',
      actorOverride?: AuditEntry['actor']
    ) => {
      setAuditLogs(prevLogs => {
        const lastHash = prevLogs.length > 0 ? prevLogs[prevLogs.length - 1].hash : GENESIS_HASH;
        const newId = `AUD-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        const timestamp = new Date().toISOString();
        const actor = actorOverride || {
          id: 'usr-lucas',
          name: 'Lucas Martins',
          role: currentRole,
          ip: '192.168.1.100',
        };

        const partialEntry = {
          id: newId,
          timestamp,
          actor,
          action,
          entityType,
          entityId,
          details,
          severity,
        };

        // We compute hash synchronously using simple digest or async
        computeAuditHash(lastHash, partialEntry).then(hash => {
          const completeEntry: AuditEntry = {
            ...partialEntry,
            previousHash: lastHash,
            hash,
          };
          setAuditLogs(current => [...current, completeEntry]);
        });

        return prevLogs;
      });
    },
    [currentRole]
  );

  // Initialize seed audit logs on mount
  useEffect(() => {
    async function initAuditChain() {
      const genesisActor = { id: 'usr-lucas', name: 'Lucas Martins', role: 'ADMIN', ip: '192.168.1.100' };
      const e1Base = {
        id: 'AUD-INIT-01',
        timestamp: '2026-10-20T08:00:00Z',
        actor: genesisActor,
        action: 'SYSTEM_BOOT',
        entityType: 'security' as const,
        entityId: 'SYS-CORE',
        details: 'Inicialização segura do cluster OmniTask com encriptação AES-256 e políticas de conformidade ativadas.',
        severity: 'low' as const,
      };
      const hash1 = await computeAuditHash(GENESIS_HASH, e1Base);
      const e1: AuditEntry = { ...e1Base, previousHash: GENESIS_HASH, hash: hash1 };

      const e2Base = {
        id: 'AUD-INIT-02',
        timestamp: '2026-10-20T08:15:00Z',
        actor: { id: 'agent-sentinel', name: 'Sentinel DevOps AI', role: 'AI_AGENT', isAI: true },
        action: 'AI_DELEGATE_ACCEPT',
        entityType: 'agent' as const,
        entityId: 'PLT-101',
        details: 'Agente Sentinel assumiu demanda de auditoria de RBAC no Kubernetes com escopo restrito.',
        severity: 'medium' as const,
      };
      const hash2 = await computeAuditHash(hash1, e2Base);
      const e2: AuditEntry = { ...e2Base, previousHash: hash1, hash: hash2 };

      const e3Base = {
        id: 'AUD-INIT-03',
        timestamp: '2026-10-20T09:30:00Z',
        actor: { id: 'agent-lex', name: 'Lex SecOps & LGPD Auditor', role: 'AI_AGENT', isAI: true },
        action: 'LGPD_POLICY_CHECK',
        entityType: 'privacy' as const,
        entityId: 'GOV-102',
        details: 'Verificação de termos de consentimento e criptografia de ponta a ponta em metadados de saúde.',
        severity: 'low' as const,
      };
      const hash3 = await computeAuditHash(hash2, e3Base);
      const e3: AuditEntry = { ...e3Base, previousHash: hash2, hash: hash3 };

      setAuditLogs([e1, e2, e3]);
    }
    initAuditChain();
  }, []);

  // Compute automatic deadline notifications
  useEffect(() => {
    const generatedNotifs: NotificationItem[] = [];
    const now = new Date();

    tasks.forEach(t => {
      const urgency = calculateUrgency(t.dueDate, t.status, now);
      if (urgency === 'OVERDUE') {
        generatedNotifs.push({
          id: `notif-overdue-${t.id}`,
          type: 'overdue',
          title: `Prazo Expirado: ${t.code}`,
          message: `A entrega de "${t.title}" está atrasada (vencimento: ${t.dueDate}).`,
          timestamp: new Date().toISOString(),
          read: false,
          taskId: t.id,
        });
      } else if (urgency === 'CRITICAL_24H') {
        generatedNotifs.push({
          id: `notif-crit-${t.id}`,
          type: 'due_24h',
          title: `Entrega Crítica Hoje (24h): ${t.code}`,
          message: `A demanda "${t.title}" vence hoje! Responsável: ${t.assignedToId}.`,
          timestamp: new Date().toISOString(),
          read: false,
          taskId: t.id,
        });
      } else if (urgency === 'UPCOMING_48H') {
        generatedNotifs.push({
          id: `notif-warn-${t.id}`,
          type: 'due_48h',
          title: `Prazo se Aproximando (48h): ${t.code}`,
          message: `"${t.title}" tem prazo final para amanhã (${t.dueDate}).`,
          timestamp: new Date().toISOString(),
          read: true,
          taskId: t.id,
        });
      }
    });

    setNotifications(generatedNotifs);
  }, [tasks]);

  const verifyLedgerIntegrity = useCallback(async () => {
    const result = await verifyAuditChain(auditLogs);
    setIsLedgerValid(result.valid);
    return result;
  }, [auditLogs]);

  // Task Mutations
  const createTask = async (taskData: Omit<Task, 'id' | 'code' | 'createdAt'>) => {
    const id = `tsk-${Date.now().toString(36)}`;
    const project = projects.find(p => p.id === taskData.projectId);
    const code = `${project ? project.code : 'TASK'}-${Math.floor(100 + Math.random() * 900)}`;

    const newTask: Task = {
      ...taskData,
      id,
      code,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    await appendAuditLog(
      'TASK_CREATE',
      'task',
      code,
      `Criada nova demanda "${newTask.title}" com prioridade ${newTask.priority.toUpperCase()}`,
      newTask.priority === 'urgent' ? 'high' : 'low'
    );
  };

  const updateTask = async (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    await appendAuditLog(
      'TASK_UPDATE',
      'task',
      updatedTask.code,
      `Atualizados parâmetros da tarefa "${updatedTask.title}"`,
      'low'
    );
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, completedAt: completedAt || t.completedAt }
          : t
      )
    );

    await appendAuditLog(
      'TASK_STATUS_CHANGE',
      'task',
      task.code,
      `Status alterado de [${task.status}] para [${newStatus}]`,
      newStatus === 'completed' ? 'medium' : 'low'
    );
  };

  const deleteTask = async (taskId: string) => {
    if (!checkPermission('TASK_DELETE')) {
      alert('Seu perfil atual não possui permissão para excluir tarefas.');
      return false;
    }
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    await appendAuditLog(
      'TASK_DELETE',
      'task',
      task.code,
      `Exclusão definitiva da demanda "${task.title}"`,
      'high'
    );
    return true;
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const newSubs = t.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: newSubs };
      })
    );
  };

  const executeAIAgentOnTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, log: 'Tarefa não encontrada' };

    const member = teamMembers.find(m => m.id === task.assignedToId);
    const agentName = member?.name || 'Sentinel DevOps AI';
    const agentRole = member?.role || 'DevOps & Automação';

    // Update status to ai_executing
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'ai_executing' } : t))
    );

    try {
      const res = await fetch('/api/ai/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          agentName,
          agentRole,
          subtasks: task.subtasks,
        }),
      });

      const data = await res.json();
      const executionLog = data.agentExecutionLog || 'Entrega processada com sucesso.';

      // Mark all subtasks as verified/completed by agent
      const updatedSubs = task.subtasks.map(s => ({ ...s, completed: true }));

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
                ...t,
                status: 'review',
                subtasks: updatedSubs,
                actualHours: (t.actualHours || 0) + 2,
                aiExecutionHistory: [
                  ...(t.aiExecutionHistory || []),
                  {
                    timestamp: new Date().toISOString(),
                    agentName,
                    log: executionLog,
                  },
                ],
              }
            : t
        )
      );

      await appendAuditLog(
        'AI_AUTONOMOUS_RUN',
        'agent',
        task.code,
        `Execução autônoma finalizada pelo agente ${agentName}. Status encaminhado para revisão.`,
        'medium',
        { id: member?.id || 'agent', name: agentName, role: 'AI_AGENT', isAI: true }
      );

      // Notification
      setNotifications(prev => [
        {
          id: `notif-ai-${Date.now()}`,
          type: 'ai_completed',
          title: `Agente Concluiu: ${task.code}`,
          message: `${agentName} finalizou a execução autônoma de "${task.title}".`,
          timestamp: new Date().toISOString(),
          read: false,
          taskId: task.id,
        },
        ...prev,
      ]);

      return { success: true, log: executionLog };
    } catch (err: any) {
      console.error('AI task execution failed:', err);
      return { success: false, log: 'Erro na chamada do agente' };
    }
  };

  const createProject = async (projData: Omit<Project, 'id'>) => {
    const id = `prj-${Date.now().toString(36)}`;
    const newProj: Project = { ...projData, id };
    setProjects(prev => [...prev, newProj]);

    await appendAuditLog(
      'PROJECT_CREATE',
      'project',
      newProj.code,
      `Criado projeto "${newProj.name}" no grupo de entregas`,
      'medium'
    );
  };

  const createProjectGroup = async (groupData: Omit<ProjectGroup, 'id'>) => {
    const id = `grp-${Date.now().toString(36)}`;
    const newGroup: ProjectGroup = { ...groupData, id };
    setProjectGroups(prev => [...prev, newGroup]);

    await appendAuditLog(
      'GROUP_CREATE',
      'project',
      id,
      `Criado grupo estratégico "${newGroup.name}" (${newGroup.department})`,
      'medium'
    );
  };

  // LGPD & Retention
  const runRetentionPolicy = async (policyId: string) => {
    const policy = retentionPolicies.find(p => p.id === policyId);
    if (!policy) return { affectedCount: 0 };

    let count = 0;
    if (policy.category === 'audit_logs') {
      // Purge non-critical older logs while keeping genesis and critical
      setAuditLogs(prev => {
        const kept = prev.filter(l => l.severity === 'high' || l.severity === 'critical' || l.action === 'SYSTEM_BOOT');
        count = prev.length - kept.length;
        return kept;
      });
    } else if (policy.category === 'completed_tasks') {
      setTasks(prev =>
        prev.map(t => {
          if (t.status === 'completed') {
            count++;
            return {
              ...t,
              title: anonymizeText(t.title),
              description: anonymizeText(t.description),
            };
          }
          return t;
        })
      );
    }

    setRetentionPolicies(prev =>
      prev.map(p => (p.id === policyId ? { ...p, lastExecutedAt: new Date().toISOString() } : p))
    );

    await appendAuditLog(
      'LGPD_RETENTION_TRIGGER',
      'privacy',
      policyId,
      `Política de retenção "${policy.name}" executada. ${count} registros processados/purgados.`,
      'high'
    );

    return { affectedCount: count };
  };

  const anonymizeUserData = async (email: string) => {
    setTasks(prev =>
      prev.map(t => ({
        ...t,
        description: t.description.replaceAll(email, anonymizeText(email)),
      }))
    );
    await appendAuditLog(
      'LGPD_RIGHT_TO_FORGOTTEN',
      'privacy',
      email,
      `Solicitação de anonimização (Art. 18 LGPD) executada com sucesso para ${anonymizeText(email)}`,
      'critical'
    );
  };

  // Cloud Backup
  const triggerCloudBackup = async (): Promise<CloudBackupRecord> => {
    const snapshotPayload = {
      projectGroups,
      projects,
      tasks,
      auditLogs,
      retentionPolicies,
      exportedAt: new Date().toISOString(),
    };

    const res = await fetch('/api/backup/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshotPayload,
        checksum: auditLogs[auditLogs.length - 1]?.hash || 'NONE',
      }),
    });
    const data = await res.json();

    const record: CloudBackupRecord = {
      id: data.backupId || `BCK-${Date.now()}`,
      name: `Snapshot Corporativo E2EE (${new Date().toLocaleDateString('pt-BR')})`,
      timestamp: new Date().toISOString(),
      sizeKb: Math.round(JSON.stringify(snapshotPayload).length / 1024),
      checksum: data.checksum || 'SHA256_VERIFIED',
      status: 'verified',
    };

    setCloudBackups(prev => [record, ...prev]);

    await appendAuditLog(
      'CLOUD_BACKUP_SNAPSHOT',
      'security',
      record.id,
      `Snapshot em nuvem gerado com sucesso (SHA-256: ${record.checksum.slice(0, 12)}...)`,
      'medium'
    );

    return record;
  };

  const syncWithGitHub = async (taskId?: string) => {
    await fetch('/api/github/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: taskId || 'ALL', issueNumber: 42 }),
    });

    await appendAuditLog(
      'GITHUB_SYNC',
      'github',
      'preventsenior-enterprise/core-platform-services',
      'Sincronização bidirecional de commits e pull requests com a API do GitHub concluída.',
      'low'
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentRole,
        setCurrentRole,
        checkPermission,
        rolePermissions,
        updateRolePermissions,
        selectedGroupId,
        setSelectedGroupId,
        selectedProjectId,
        setSelectedProjectId,
        searchQuery,
        setSearchQuery,
        projectGroups,
        projects,
        tasks,
        teamMembers,
        auditLogs,
        notifications,
        retentionPolicies,
        cloudBackups,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        toggleSubtask,
        executeAIAgentOnTask,
        createProject,
        createProjectGroup,
        e2eeSecretKey,
        setE2EESecretKey,
        verifyLedgerIntegrity,
        isLedgerValid,
        runRetentionPolicy,
        anonymizeUserData,
        triggerCloudBackup,
        syncWithGitHub,
        githubRepoName: 'preventsenior-enterprise/core-platform-services',
        markNotificationRead,
        clearAllNotifications,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
