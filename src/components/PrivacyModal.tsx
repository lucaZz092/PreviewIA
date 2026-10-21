import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  FileText,
  UserX,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  Play,
} from 'lucide-react';
import { generateDSARDossier, RetentionPolicy } from '../utils/privacy';
import { downloadFile } from '../utils/reports';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  const {
    retentionPolicies,
    runRetentionPolicy,
    anonymizeUserData,
    auditLogs,
    tasks,
    checkPermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'retention' | 'dsar' | 'forget'>('retention');
  const [anonymizeEmailInput, setAnonymizeEmailInput] = useState('');
  const [anonymizeSuccess, setAnonymizeSuccess] = useState(false);
  const [runningPolicyId, setRunningPolicyId] = useState<string | null>(null);
  const [retentionMessage, setRetentionMessage] = useState<string | null>(null);

  const handleRunPolicy = async (policyId: string) => {
    setRunningPolicyId(policyId);
    setRetentionMessage(null);
    const result = await runRetentionPolicy(policyId);
    setRetentionMessage(`Política executada com sucesso. ${result.affectedCount} registros purgados/anonimizados.`);
    setRunningPolicyId(null);
  };

  const handleExportDSAR = () => {
    const dossier = generateDSARDossier({
      userId: 'usr-lucas',
      name: 'Lucas Martins',
      email: 'lucas.martins@preventsenior.com.br',
      assignedTasksCount: tasks.length,
      auditActionsCount: auditLogs.length,
      consentGrantedAt: '2026-01-15T09:00:00Z',
    });

    const payload = JSON.stringify(dossier, null, 2);
    downloadFile(payload, `dossie_lgpd_art18_${Date.now()}.json`, 'application/json');
  };

  const handleForgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymizeEmailInput.trim()) return;

    if (!checkPermission('PRIVACY_ERASE')) {
      alert('Seu perfil atual de acesso não possui permissão para executar exclusão ou anonimização LGPD.');
      return;
    }

    if (confirm(`Confirmar anonimização de todos os registros associados a ${anonymizeEmailInput}? Esta ação é irreversível.`)) {
      await anonymizeUserData(anonymizeEmailInput.trim());
      setAnonymizeSuccess(true);
      setAnonymizeEmailInput('');
      setTimeout(() => setAnonymizeSuccess(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Portal de Privacidade & Governança (LGPD / GDPR)
              </h3>
              <p className="text-[11px] text-slate-400">
                Lei 13.709/2018 (Brasil) & Regulamento Geral sobre a Proteção de Dados (UE 2016/679)
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

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('retention')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'retention'
                ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Políticas de Retenção Automatizadas
          </button>
          <button
            onClick={() => setActiveTab('dsar')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'dsar'
                ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dossiê de Portabilidade (DSAR)
          </button>
          <button
            onClick={() => setActiveTab('forget')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'forget'
                ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direito ao Esquecimento (Art. 18 LGPD)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {retentionMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{retentionMessage}</span>
            </div>
          )}

          {activeTab === 'retention' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  Agendador de Retenção & Expurgo Automatizado
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para cumprir os princípios de minimização e limitação de armazenamento da LGPD, os
                  dados que atingem o período limite são purgados ou anonimizados com registro
                  criptográfico no ledger de auditoria.
                </p>
              </div>

              <div className="space-y-3">
                {retentionPolicies.map(policy => (
                  <div
                    key={policy.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{policy.name}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {policy.retentionDays} dias
                        </span>
                        <span className="text-[10px] uppercase font-mono text-emerald-400">
                          {policy.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{policy.description}</p>
                      {policy.lastExecutedAt && (
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          Última execução: {policy.lastExecutedAt.slice(0, 10)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleRunPolicy(policy.id)}
                      disabled={runningPolicyId === policy.id}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{runningPolicyId === policy.id ? 'Processando...' : 'Executar Expurgo'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dsar' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Dossiê Completo de Dados Pessoais (Portabilidade)</span>
                  </h4>
                  <button
                    onClick={handleExportDSAR}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Dossiê (.JSON)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exporta todas as informações armazenadas sobre o titular, logs de consentimento,
                  histórico de demandas e métricas de auditoria em conformidade com o Art. 18, inciso V
                  da LGPD.
                </p>
              </div>

              {/* DPO Contact Info Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-200">Encarregado de Proteção de Dados (DPO)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-400">Encarregada Titular:</span>
                    <p className="text-slate-200 font-medium">Dra. Camila Duarte</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Canal de Atendimento:</span>
                    <p className="text-slate-200 font-mono">dpo@empresa.com.br</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forget' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-200">
                    Direito à Eliminação e Anonimização
                  </h4>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    Permite ao titular solicitar a descaracterização de dados pessoais em tarefas,
                    metadados e comentários. Registros essenciais de auditoria de segurança são mantidos
                    conforme permissão legal (Art. 16 LGPD).
                  </p>
                </div>
              </div>

              {anonymizeSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Solicitação executada: Todos os registros vinculados foram devidamente mascarados.</span>
                </div>
              )}

              <form onSubmit={handleForgetSubmit} className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">
                  E-mail do Colaborador / Titular para Anonimização:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={anonymizeEmailInput}
                    onChange={(e) => setAnonymizeEmailInput(e.target.value)}
                    placeholder="ex: colaborador@preventsenior.com.br"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Anonimizar Dados</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
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
