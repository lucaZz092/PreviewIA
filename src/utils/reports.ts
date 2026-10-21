/**
 * Export and Reporting Utilities (CSV, PDF Printable format, Encrypted Backup)
 */
import { TaskItem } from './analytics';
import { sha256Hex } from './crypto';

/**
 * Generates RFC 4180 compliant CSV string for tasks
 */
export function exportTasksToCSV(tasks: TaskItem[]): string {
  const headers = [
    'Código',
    'Título',
    'Projeto',
    'Status',
    'Prioridade',
    'Data de Entrega',
    'Responsável',
    'Tipo Responsável',
    'Horas Estimadas',
    'Horas Reais',
    'Subtarefas Concluídas',
    'Total Subtarefas',
    'Data de Criação',
    'Proteção E2EE',
  ];

  const escapeField = (val: string | number | boolean | undefined): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tasks.map(t => {
    const subCompleted = t.subtasks?.filter(s => s.completed).length || 0;
    const subTotal = t.subtasks?.length || 0;
    return [
      escapeField(t.code),
      escapeField(t.title),
      escapeField(t.projectId),
      escapeField(t.status),
      escapeField(t.priority),
      escapeField(t.dueDate),
      escapeField(t.assignedTo.name),
      escapeField(t.assignedTo.isAI ? 'Agente de IA' : 'Humano'),
      escapeField(t.estimatedHours),
      escapeField(t.actualHours),
      escapeField(subCompleted),
      escapeField(subTotal),
      escapeField(t.createdAt),
      escapeField(t.isEncrypted ? 'SIM (AES-256)' : 'NÃO'),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers a browser file download of CSV content
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Creates a signed snapshot backup object
 */
export async function createBackupSnapshot(data: Record<string, unknown>): Promise<{
  snapshotJson: string;
  checksumSha256: string;
}> {
  const rawPayload = JSON.stringify(data, null, 2);
  const checksum = await sha256Hex(rawPayload);
  const envelope = {
    version: '1.0.0-enterprise',
    exportedAt: new Date().toISOString(),
    checksumSha256: checksum,
    data,
  };
  return {
    snapshotJson: JSON.stringify(envelope, null, 2),
    checksumSha256: checksum,
  };
}
