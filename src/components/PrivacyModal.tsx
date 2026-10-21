import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Tabs, Field, fieldClass, secondaryButton, primaryButton } from './Modal';
import { formatDate } from './status';
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
    <Modal title="Privacidade" onClose={onClose}>
      <div className="space-y-6">
        <Tabs
          tabs={[
            { id: 'retention', label: 'Retenção' },
            { id: 'dsar', label: 'Exportar dados' },
            { id: 'forget', label: 'Anonimizar' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'retention' && (
          <div className="space-y-3">
            {retentionMessage && <p className="text-[13px] text-emerald-700">{retentionMessage}</p>}
            <ul className="divide-y divide-neutral-100">
              {retentionPolicies.map(policy => (
                <li key={policy.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] text-neutral-900">{policy.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Após {policy.retentionDays} dias
                      {policy.lastExecutedAt && ` · última execução ${formatDate(policy.lastExecutedAt.slice(0, 10))}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunPolicy(policy.id)}
                    disabled={runningPolicyId === policy.id}
                    className={secondaryButton}
                  >
                    {runningPolicyId === policy.id ? 'Executando…' : 'Executar'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'dsar' && (
          <div className="space-y-6">
            <p className="text-[13px] text-neutral-600">
              Baixe todos os dados pessoais armazenados sobre você, conforme o Art. 18 da LGPD.
            </p>
            <button onClick={handleExportDSAR} className={primaryButton}>Baixar meus dados</button>
            <p className="text-xs text-neutral-500">
              Dúvidas: Dra. Camila Duarte · dpo@empresa.com.br
            </p>
          </div>
        )}

        {activeTab === 'forget' && (
          <form onSubmit={handleForgetSubmit} className="space-y-4">
            <p className="text-[13px] text-neutral-600">
              Remove dados pessoais de tarefas e comentários. Registros de segurança são mantidos. Essa ação não pode ser desfeita.
            </p>
            {anonymizeSuccess && <p className="text-[13px] text-emerald-700">Dados anonimizados.</p>}
            <Field label="E-mail da pessoa">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={anonymizeEmailInput}
                  onChange={(e) => setAnonymizeEmailInput(e.target.value)}
                  placeholder="nome@empresa.com.br"
                  className={fieldClass}
                />
                <button type="submit" className="h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium whitespace-nowrap">
                  Anonimizar
                </button>
              </div>
            </Field>
          </form>
        )}
      </div>
    </Modal>
  );
};
