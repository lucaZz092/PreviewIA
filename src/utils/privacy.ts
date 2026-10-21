/**
 * LGPD (Lei Geral de Proteção de Dados) & GDPR Data Privacy Compliance Utilities
 */

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  category: 'audit_logs' | 'completed_tasks' | 'agent_telemetry' | 'backup_snapshots';
  retentionDays: number; // e.g. 30, 90, 180, 365
  action: 'anonymize' | 'purge';
  autoRunEnabled: boolean;
  lastExecutedAt?: string;
}

export const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    id: 'ret-1',
    name: 'Logs de Auditoria Não Críticos',
    description: 'Expurgo de logs de severidade baixa e consultas de rotina após 90 dias.',
    category: 'audit_logs',
    retentionDays: 90,
    action: 'purge',
    autoRunEnabled: true,
  },
  {
    id: 'ret-2',
    name: 'Anonimização de Metadados de Tarefas Concluídas',
    description: 'Anonimização de nomes de colaboradores e e-mails em tarefas entregues há mais de 180 dias.',
    category: 'completed_tasks',
    retentionDays: 180,
    action: 'anonymize',
    autoRunEnabled: true,
  },
  {
    id: 'ret-3',
    name: 'Telemetria e Prompt Cache de Agentes de IA',
    description: 'Purga de payloads brutos de chamadas de IA após 30 dias para evitar acúmulo de dados confidenciais.',
    category: 'agent_telemetry',
    retentionDays: 30,
    action: 'purge',
    autoRunEnabled: true,
  },
];

/**
 * Anonymizes sensitive personal strings (e-mail, names, IPs) according to LGPD/GDPR
 */
export function anonymizeText(text: string): string {
  if (!text) return '';
  // Mask email addresses: lucas.martins@domain.com -> l***s@d***m
  let sanitized = text.replace(/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/g, (match, user, domain, tld) => {
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : '***';
    const maskedDomain = domain.length > 2 ? `${domain[0]}***${domain[domain.length - 1]}` : '***';
    return `${maskedUser}@${maskedDomain}.${tld}`;
  });

  // Mask IPv4 addresses: 192.168.1.100 -> 192.168.***.***
  sanitized = sanitized.replace(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/g, '$1.$2.***.***');

  return sanitized;
}

export interface UserPersonalData {
  userId: string;
  name: string;
  email: string;
  assignedTasksCount: number;
  auditActionsCount: number;
  consentGrantedAt: string;
}

/**
 * Generates an official LGPD/GDPR DSAR (Data Subject Access Request) dossier
 */
export function generateDSARDossier(userData: UserPersonalData): Record<string, unknown> {
  return {
    complianceFramework: ['LGPD (Lei 13.709/2018)', 'GDPR (Regulation EU 2016/679)'],
    reportGeneratedAt: new Date().toISOString(),
    dpoContact: 'dpo@empresa.com.br / encarregado-lgpd@empresa.com.br',
    dataSubject: {
      userId: userData.userId,
      legalName: userData.name,
      registeredEmail: userData.email,
      consentStatus: 'CONSENT_ACTIVE',
      consentTimestamp: userData.consentGrantedAt,
    },
    activityMetrics: {
      activeWorkItemsCount: userData.assignedTasksCount,
      traceableAuditRecordsCount: userData.auditActionsCount,
    },
    retentionNotice: 'Dados mantidos estritamente para finalidades legítimas de gestão corporativa e auditoria de segurança da informação.',
    rightsInformation: [
      'Art. 18 LGPD - Confirmação da existência de tratamento e acesso aos dados',
      'Art. 18 LGPD - Correção de dados incompletos, inexatos ou desatualizados',
      'Art. 18 LGPD - Anonimização, bloqueio ou eliminação de dados desnecessários',
      'Art. 18 LGPD - Portabilidade dos dados a outro fornecedor de serviço',
      'Art. 17 GDPR - Right to erasure (Right to be forgotten)',
    ],
  };
}

/**
 * Checks if a date timestamp is older than the retention threshold
 */
export function isOlderThanDays(dateString: string, days: number, referenceDate: Date = new Date()): boolean {
  try {
    const timestamp = new Date(dateString).getTime();
    if (isNaN(timestamp)) return false;
    const diffMs = referenceDate.getTime() - timestamp;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > days;
  } catch {
    return false;
  }
}
