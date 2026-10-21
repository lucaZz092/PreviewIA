import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cloud,
  Lock,
  Download,
  ShieldCheck,
  CheckCircle,
  Key,
  X,
  RefreshCw,
} from 'lucide-react';
import { downloadFile, createBackupSnapshot } from '../utils/reports';

interface CloudBackupModalProps {
  onClose: () => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({ onClose }) => {
  const {
    cloudBackups,
    triggerCloudBackup,
    e2eeSecretKey,
    setE2EESecretKey,
    projectGroups,
    projects,
    tasks,
    auditLogs,
    checkPermission,
  } = useApp();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [keyInput, setKeyInput] = useState(e2eeSecretKey);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  const handleGenerateBackup = async () => {
    if (!checkPermission('SECURITY_BACKUP')) {
      alert('Seu perfil não tem permissão para gerar backups em nuvem.');
      return;
    }
    setIsBackingUp(true);
    const result = await triggerCloudBackup();
    setIsBackingUp(false);
    setBackupSuccess(`Snapshot ${result.id} gerado e criptografado na nuvem com sucesso!`);
    setTimeout(() => setBackupSuccess(null), 4000);
  };

  const handleDownloadOfflineArchive = async () => {
    const payload = {
      projectGroups,
      projects,
      tasks,
      auditLogs,
      exportedAt: new Date().toISOString(),
    };
    const snapshot = await createBackupSnapshot(payload);
    downloadFile(
      snapshot.snapshotJson,
      `omnitask_encrypted_backup_${Date.now()}.json`,
      'application/json'
    );
  };

  const handleSaveKey = () => {
    if (!keyInput.trim()) return;
    setE2EESecretKey(keyInput.trim());
    alert('Chave de criptografia E2EE atualizada localmente.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Backups Regulares em Nuvem & Criptografia E2EE
              </h3>
              <p className="text-[11px] text-slate-500">
                Snapshots periódicos com hash SHA-256 e padrão criptográfico AES-256-GCM.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {backupSuccess && (
            <div className="p-3 bg-emerald-50/40 border border-emerald-200/60 rounded-lg flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{backupSuccess}</span>
            </div>
          )}

          {/* Action Trigger Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Criar Snapshot em Nuvem Imediato</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Salva todas as demandas, matrizes RBAC e a trilha de auditoria criptografada.
              </p>
            </div>
            <button
              onClick={handleGenerateBackup}
              disabled={isBackingUp}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? 'Processando...' : 'Gerar Backup'}</span>
            </button>
          </div>

          {/* Backup History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Histórico de Pontos de Restauração
              </h4>
              <button
                onClick={handleDownloadOfflineArchive}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Cópia Offline (.JSON)</span>
              </button>
            </div>

            <div className="space-y-2">
              {cloudBackups.map(bck => (
                <div
                  key={bck.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{bck.name}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        {bck.sizeKb} KB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                      <span>ID: {bck.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>SHA-256: {bck.checksum.slice(0, 16)}...</span>
                      <span aria-hidden="true">·</span>
                      <span>{bck.timestamp.slice(0, 10)}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase">
                    Verificado
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* E2EE Secret Key Management */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-800">Chave Mestra de Criptografia E2EE</h4>
            </div>
            <p className="text-xs text-slate-500">
              Esta chave privada deriva as chaves AES-256 no cliente para cifrar e decifrar notas
              confidenciais de tarefas.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSaveKey}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Atualizar Chave
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
