import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, primaryButton } from './Modal';

interface GitHubModalProps {
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ onClose }) => {
  const { syncWithGitHub, githubRepoName } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const mockCommits = [
    {
      sha: 'a8f94e2',
      message: 'feat(auth): enforce sha256 audit chaining & AES-GCM notes',
      author: 'lucas.martins',
      timestamp: 'Hoje às 17:42',
      branch: 'main',
    },
    {
      sha: 'b3c109d',
      message: 'chore(agents): add Sentinel & Nexus autonomous hooks',
      author: 'sentinel-bot[bot]',
      timestamp: 'Hoje às 16:15',
      branch: 'feature/ai-orchestrator',
    },
    {
      sha: 'e5f201a',
      message: 'fix(security): sanitize email & IP according to LGPD Art. 18',
      author: 'lex-auditor[bot]',
      timestamp: 'Ontem às 19:20',
      branch: 'compliance/lgpd-retention',
    },
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithGitHub();
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  return (
    <Modal title="GitHub" onClose={onClose}>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[13px] font-medium text-neutral-900 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {githubRepoName}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {syncSuccess ? 'Sincronizado agora.' : 'Conectado'}
            </p>
          </div>
          <button onClick={handleSync} disabled={isSyncing} className={primaryButton}>
            {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
          </button>
        </div>

        <section>
          <h3 className="mb-2 text-[13px] font-medium text-neutral-900">Commits recentes</h3>
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {mockCommits.map(c => (
              <li key={c.sha} className="py-3">
                <p className="text-[13px] text-neutral-900">{c.message}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {c.author} · {c.timestamp} · <span className="font-mono">{c.sha}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
};
