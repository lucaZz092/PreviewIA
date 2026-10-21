import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Github, RefreshCw, GitCommit, GitPullRequest, CheckCircle, ExternalLink, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Github className="w-5 h-5 text-slate-800" />
            <h3 className="text-sm font-bold text-slate-800">Integração GitHub Enterprise API</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-800 font-mono">{githubRepoName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Conexão ativa · Webhooks sincronizados com eventos de push e pull request.
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          </div>

          {syncSuccess && (
            <div className="p-3 bg-emerald-50/40 border border-emerald-200/60 rounded-lg flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Repositório sincronizado com sucesso! Trilha de auditoria atualizada.</span>
            </div>
          )}

          {/* Commits Stream */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-blue-600" />
              <span>Últimos Commits Vinculados a Demandas</span>
            </h4>

            <div className="space-y-2">
              {mockCommits.map(c => (
                <div
                  key={c.sha}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-600 font-bold">{c.sha}</span>
                      <span className="text-slate-800 font-medium">{c.message}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>Autor: {c.author}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-500">branch: {c.branch}</span>
                      <span aria-hidden="true">·</span>
                      <span>{c.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Endpoint Info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs">
            <p className="text-slate-500 text-[11px] uppercase">Webhook Listener Ativo:</p>
            <p className="text-blue-600 bg-white p-2 rounded break-all">
              POST https://ais-pre-whclocyb7noojh2mp5ae6x-448195333888.us-east1.run.app/api/github/sync
            </p>
            <p className="text-slate-500 text-[11px] font-sans">
              Eventos monitorados: push, pull_request, issues, check_run (CI/CD).
            </p>
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
