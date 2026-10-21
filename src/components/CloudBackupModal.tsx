import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Field, fieldClass, primaryButton, secondaryButton, linkButton } from './Modal';
import { formatDate } from './status';
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
    <Modal title="Backup e criptografia" onClose={onClose}>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-neutral-600">
            {backupSuccess || 'Salva tarefas, projetos e atividade de forma criptografada.'}
          </p>
          <button onClick={handleGenerateBackup} disabled={isBackingUp} className={primaryButton}>
            {isBackingUp ? 'Gerando…' : 'Gerar backup'}
          </button>
        </div>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-[13px] font-medium text-neutral-900">Backups</h3>
            <button onClick={handleDownloadOfflineArchive} className={linkButton}>Baixar cópia local</button>
          </div>
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {cloudBackups.map(bck => (
              <li key={bck.id} className="flex items-baseline justify-between gap-4 py-3 text-[13px]">
                <span className="truncate text-neutral-900">{bck.name}</span>
                <span className="shrink-0 text-xs text-neutral-500 tabular-nums">
                  {formatDate(bck.timestamp.slice(0, 10))} · {bck.sizeKb} KB
                </span>
              </li>
            ))}
          </ul>
        </section>

        <Field label="Chave de criptografia">
          <div className="flex gap-2">
            <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} className={`${fieldClass} font-mono`} />
            <button onClick={handleSaveKey} disabled={keyInput === e2eeSecretKey} className={secondaryButton}>Salvar</button>
          </div>
        </Field>
      </div>
    </Modal>
  );
};
