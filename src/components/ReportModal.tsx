import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, primaryButton, secondaryButton } from './Modal';
import { STATUS_LABEL, formatDate } from './status';
import { exportTasksToCSV, downloadFile } from '../utils/reports';
import { computeProductivityMetrics } from '../utils/analytics';

interface ReportModalProps {
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
  const { tasks, teamMembers, projects, auditLogs } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const mappedTasks = tasks.map(t => {
    const member = teamMembers.find(m => m.id === t.assignedToId);
    return {
      ...t,
      assignedTo: {
        id: t.assignedToId,
        name: member?.name || 'Membro',
        avatar: member?.avatar,
        isAI: Boolean(member?.isAI),
        role: member?.role || 'Executor',
      },
    };
  });

  const metrics = computeProductivityMetrics(mappedTasks);
  const latestHash = auditLogs[auditLogs.length - 1]?.hash || 'GENESIS_0000';

  const handleExportCSV = () => {
    const csvContent = exportTasksToCSV(mappedTasks);
    downloadFile(csvContent, `omnitask_relatorio_${Date.now()}.csv`, 'text/csv;charset=utf-8');
    setDownloadSuccess('Relatório CSV exportado com sucesso.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <Modal
      size="lg"
      title="Exportar relatório"
      onClose={onClose}
      footer={
        <>
          {downloadSuccess && <span className="mr-auto text-[13px] text-emerald-700">{downloadSuccess}</span>}
          <button onClick={handlePrintPDF} className={secondaryButton}>Imprimir / PDF</button>
          <button onClick={handleExportCSV} className={primaryButton}>Baixar CSV</button>
        </>
      }
    >
      <div className="space-y-6 text-neutral-900">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] text-neutral-500">Prévia</p>
          <p className="text-[13px] text-neutral-500">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <dl className="grid grid-cols-3 gap-6">
          <div>
            <dt className="text-xs text-neutral-500">Tarefas</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums">{metrics.totalTasks}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Concluídas</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums">{metrics.overallCompletionRate}%</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Com agentes</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums">{metrics.aiTaskSharePercentage}%</dd>
          </div>
        </dl>

        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500">
              <th className="py-2 font-normal">Tarefa</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 font-normal">Responsável</th>
              <th className="py-2 font-normal text-right">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tasks.map(t => (
              <tr key={t.id}>
                <td className="py-2 pr-4">{t.title}</td>
                <td className="py-2 pr-4 whitespace-nowrap text-neutral-600">{STATUS_LABEL[t.status]}</td>
                <td className="py-2 pr-4 whitespace-nowrap text-neutral-600">{teamMembers.find(m => m.id === t.assignedToId)?.name || '—'}</td>
                <td className="py-2 whitespace-nowrap text-right tabular-nums text-neutral-500">{formatDate(t.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="font-mono text-[11px] text-neutral-400 break-all">Assinatura {latestHash.slice(0, 32)}…</p>
      </div>
    </Modal>
  );
};
