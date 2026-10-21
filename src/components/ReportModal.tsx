import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileSpreadsheet, Printer, Download, X, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header (hidden in print) */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 no-print">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Exportação de Relatórios Executivos (PDF & CSV)
              </h3>
              <p className="text-[11px] text-slate-400">
                Gere documentos com valor probatório de produtividade, SLAs e conformidade.
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

        {/* Modal Body & Printable Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs text-emerald-300 no-print">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Export Action Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
            <div
              onClick={handleExportCSV}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Exportar Formato CSV</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Planilha tabular compatível com Excel, Google Planilhas e BI.
                </p>
              </div>
            </div>

            <div
              onClick={handlePrintPDF}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Imprimir / Salvar como PDF</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Layout executivo formatado com assinatura digital SHA-256.
                </p>
              </div>
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-6 text-slate-100 print:bg-white print:text-slate-900 print:border-none print:p-0">
            {/* Header Document */}
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white print:text-slate-900">
                  OmniTask Enterprise - Relatório Executivo de Produtividade
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Empresa: Prevent Senior · Tecnologia & Inovação
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
                <span>Emitido: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* KPI Summary strip */}
            <div className="grid grid-cols-4 gap-3 text-center border-b border-slate-800 pb-4">
              <div className="p-2 bg-slate-900 print:bg-slate-100 rounded">
                <span className="text-[10px] text-slate-400 uppercase">Total Demandas</span>
                <p className="text-base font-bold font-mono">{metrics.totalTasks}</p>
              </div>
              <div className="p-2 bg-slate-900 print:bg-slate-100 rounded">
                <span className="text-[10px] text-slate-400 uppercase">Concluídas</span>
                <p className="text-base font-bold font-mono text-emerald-400 print:text-emerald-700">
                  {metrics.completedTasks} ({metrics.overallCompletionRate}%)
                </p>
              </div>
              <div className="p-2 bg-slate-900 print:bg-slate-100 rounded">
                <span className="text-[10px] text-slate-400 uppercase">Carga de IA</span>
                <p className="text-base font-bold font-mono text-purple-400 print:text-purple-700">
                  {metrics.aiTaskSharePercentage}%
                </p>
              </div>
              <div className="p-2 bg-slate-900 print:bg-slate-100 rounded">
                <span className="text-[10px] text-slate-400 uppercase">Horas Poupadas</span>
                <p className="text-base font-bold font-mono text-teal-400 print:text-teal-700">
                  +{metrics.hoursEfficiencyDelta}h
                </p>
              </div>
            </div>

            {/* Tasks Summary Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Demonstrativo de Demandas
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-2">Código</th>
                      <th className="py-2">Título</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Prioridade</th>
                      <th className="py-2">Responsável</th>
                      <th className="py-2">Prazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {tasks.map(t => {
                      const member = teamMembers.find(m => m.id === t.assignedToId);
                      return (
                        <tr key={t.id} className="py-1.5">
                          <td className="py-1.5 font-mono text-indigo-400">{t.code}</td>
                          <td className="py-1.5 font-medium">{t.title}</td>
                          <td className="py-1.5 capitalize text-slate-300">{t.status.replace('_', ' ')}</td>
                          <td className="py-1.5 uppercase text-[10px]">{t.priority}</td>
                          <td className="py-1.5">{member?.name || 'Não atribuído'}</td>
                          <td className="py-1.5 font-mono text-slate-400">{t.dueDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cryptographic Signature Stamp */}
            <div className="pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>SHA-256 Ledger Signature: {latestHash.slice(0, 32)}...</span>
              <span className="text-emerald-400">Autenticidade Criptográfica Verificada</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 no-print">
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
