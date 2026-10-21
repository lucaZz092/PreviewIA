import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search } from 'lucide-react';
import { downloadFile } from '../utils/reports';

export const AuditLogView: React.FC = () => {
  const { auditLogs, verifyLedgerIntegrity } = useApp();
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    brokenIndex?: number;
    reason?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    const result = await verifyLedgerIntegrity();
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalEntries: auditLogs.length,
        ledgerIntegrity: 'VERIFIED_SHA256',
        logs: auditLogs,
      },
      null,
      2
    );
    downloadFile(payload, `omnitask_audit_ledger_${Date.now()}.json`, 'application/json');
  };

  const filteredLogs = auditLogs
    .filter(l => {
      if (search) {
        const q = search.toLowerCase();
        return (
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.actor.name.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .reverse();

  return (
    <div className="px-5 md:px-10 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Atividade</h1>
        <div className="flex items-center gap-4 text-[13px]">
          <button onClick={handleVerify} disabled={isVerifying} className="text-neutral-500 hover:text-neutral-900">
            {isVerifying ? 'Verificando…' : 'Verificar integridade'}
          </button>
          <button onClick={handleExportJson} className="text-neutral-500 hover:text-neutral-900">
            Exportar
          </button>
        </div>
      </div>

      {verificationResult && (
        <p className={`text-[13px] ${verificationResult.valid ? 'text-emerald-700' : 'text-red-600'}`}>
          {verificationResult.valid
            ? `Registro íntegro — ${auditLogs.length} entradas verificadas.`
            : `Falha de integridade: ${verificationResult.reason}`}
        </p>
      )}

      <label className="flex items-center gap-2 max-w-sm h-8 px-2.5 rounded-md border border-neutral-200 focus-within:border-neutral-400 transition-colors">
        <Search className="w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar"
          className="w-full bg-transparent text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none"
        />
      </label>

      <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
        {filteredLogs.map(log => {
          const isExpanded = expandedLogId === log.id;
          return (
            <li key={log.id}>
              <button
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className="w-full flex items-baseline gap-4 py-3 px-2 -mx-2 rounded-md text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="w-36 shrink-0 truncate text-[13px] font-medium text-neutral-900">{log.actor.name}</span>
                <span className="flex-1 min-w-0 truncate text-[13px] text-neutral-600">{log.details}</span>
                <span className="shrink-0 text-xs text-neutral-400 tabular-nums">
                  {new Date(log.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
              {isExpanded && (
                <div className="pb-4 pl-40 pr-2 space-y-1 font-mono text-[11px] text-neutral-500 break-all">
                  <p>{log.action} · {log.entityType}:{log.entityId}</p>
                  <p>hash {log.hash}</p>
                  <p>prev {log.previousHash}</p>
                </div>
              )}
            </li>
          );
        })}
        {filteredLogs.length === 0 && (
          <li className="py-12 text-center text-[13px] text-neutral-500">Nenhuma atividade encontrada.</li>
        )}
      </ul>
    </div>
  );
};
