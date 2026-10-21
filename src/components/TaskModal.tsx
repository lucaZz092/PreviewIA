import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import {
  X,
  Bot,
  User,
  Calendar,
  Clock,
  Shield,
  Lock,
  Unlock,
  Github,
  Zap,
  CheckCircle,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { encryptE2EE, decryptE2EE } from '../utils/crypto';
import { calculateUrgency } from '../utils/analytics';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
  onOpenGitHubModal?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose, onOpenGitHubModal }) => {
  const {
    tasks,
    updateTask,
    deleteTask,
    teamMembers,
    projects,
    executeAIAgentOnTask,
    checkPermission,
    e2eeSecretKey,
  } = useApp();

  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'e2ee' | 'ai_logs'>('details');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isExecutingAI, setIsExecutingAI] = useState(false);
  const [e2eeDecryptedText, setE2EEDecryptedText] = useState<string | null>(null);
  const [e2eeInputText, setE2EEInputText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const assignedMember = teamMembers.find(m => m.id === task.assignedToId);
  const isAgent = Boolean(assignedMember?.isAI);
  const urgency = calculateUrgency(task.dueDate, task.status);

  // Subtask handlers
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    updateTask({
      ...task,
      subtasks: [...task.subtasks, newSub],
    });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    const updated = task.subtasks.map(s => (s.id === subId ? { ...s, completed: !s.completed } : s));
    updateTask({ ...task, subtasks: updated });
  };

  const handleRemoveSubtask = (subId: string) => {
    const updated = task.subtasks.filter(s => s.id !== subId);
    updateTask({ ...task, subtasks: updated });
  };

  // Autonomous AI execution
  const handleTriggerAI = async () => {
    setIsExecutingAI(true);
    await executeAIAgentOnTask(task.id);
    setIsExecutingAI(false);
    setActiveTab('ai_logs');
  };

  // E2EE decrypt / encrypt
  const handleDecryptNote = async () => {
    if (!task.encryptedNote) return;
    setIsDecrypting(true);
    const decrypted = await decryptE2EE(task.encryptedNote, e2eeSecretKey);
    setE2EEDecryptedText(decrypted);
    setIsDecrypting(false);
  };

  const handleSaveEncryptedNote = async () => {
    if (!e2eeInputText.trim()) return;
    const cipher = await encryptE2EE(e2eeInputText, e2eeSecretKey);
    updateTask({
      ...task,
      isEncrypted: true,
      encryptedNote: cipher,
    });
    setE2EEDecryptedText(e2eeInputText);
    setE2EEInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-800/50">
              {task.code}
            </span>
            <span
              className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${
                task.priority === 'urgent'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {task.priority}
            </span>
            {task.isEncrypted && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>E2EE Ativo</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {checkPermission('TASK_DELETE') && (
              <button
                onClick={async () => {
                  if (confirm(`Deseja realmente excluir a tarefa ${task.code}?`)) {
                    await deleteTask(task.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                title="Excluir Tarefa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'details'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Detalhes & Atribuição
          </button>
          <button
            onClick={() => setActiveTab('subtasks')}
            className={`pb-2.5 transition-colors flex items-center gap-1.5 ${
              activeTab === 'subtasks'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Checklist</span>
            <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded">
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('e2ee')}
            className={`pb-2.5 transition-colors flex items-center gap-1.5 ${
              activeTab === 'e2ee'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Notas Confidenciais (E2EE)</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_logs')}
            className={`pb-2.5 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai_logs'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Execuções de IA</span>
            {task.aiExecutionHistory && task.aiExecutionHistory.length > 0 && (
              <span className="font-mono text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded">
                {task.aiExecutionHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Title & Description */}
              <div>
                <label className="text-xs font-semibold text-slate-400">Título da Demanda</label>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => updateTask({ ...task, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-semibold text-white mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Escopo e Descrição Técnica
                </label>
                <textarea
                  rows={4}
                  value={task.description}
                  onChange={(e) => updateTask({ ...task, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Assignment & Status Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Assignee */}
                <div>
                  <label className="text-xs font-semibold text-slate-400">
                    Responsável (Humano ou Agente IA)
                  </label>
                  <select
                    value={task.assignedToId}
                    onChange={(e) => updateTask({ ...task, assignedToId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <optgroup label="Agentes de IA Corporativos">
                      {teamMembers
                        .filter(m => m.isAI)
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            🤖 {m.name} ({m.role})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Equipe Humana">
                      {teamMembers
                        .filter(m => !m.isAI)
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            👤 {m.name} ({m.role})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-slate-400">Status do Fluxo</label>
                  <select
                    value={task.status}
                    onChange={(e) => updateTask({ ...task, status: e.target.value as TaskStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="ai_executing">Execução IA Autônoma</option>
                    <option value="review">Em Revisão</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-xs font-semibold text-slate-400">
                    Prazo Crítico (SLA)
                  </label>
                  <input
                    type="date"
                    value={task.dueDate}
                    onChange={(e) => updateTask({ ...task, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* GitHub Linkage */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-semibold text-slate-200">
                      Integração com GitHub
                    </span>
                  </div>
                  {task.githubPrUrl && (
                    <a
                      href={task.githubPrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>PR #{task.githubIssueNumber}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Esta demanda sincroniza branches, verificações de pull request e commits
                  automaticamente via Webhook.
                </p>
              </div>

              {/* Autonomous AI Trigger Button */}
              {isAgent && checkPermission('AI_TRIGGER_RUN') && (
                <div className="p-4 bg-purple-950/30 border border-purple-800/50 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>Delegação Autônoma ao Agente {assignedMember?.name}</span>
                    </h4>
                    <p className="text-xs text-purple-300/80 mt-0.5">
                      Dispare a IA para processar os requisitos, validar as subtarefas e propor a
                      entrega técnica.
                    </p>
                  </div>
                  <button
                    onClick={handleTriggerAI}
                    disabled={isExecutingAI}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 shadow-md shadow-purple-600/20"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isExecutingAI ? 'Executando...' : 'Executar com IA'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Nova subtarefa ou critério de aceitação..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="divide-y divide-slate-800 bg-slate-950 border border-slate-800 rounded-xl">
                {task.subtasks.map(s => (
                  <div
                    key={s.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                  >
                    <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={s.completed}
                        onChange={() => handleToggleSubtask(s.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 border-slate-700 bg-slate-900 cursor-pointer"
                      />
                      <span
                        className={`text-xs ${
                          s.completed ? 'line-through text-slate-400' : 'text-slate-200 font-medium'
                        }`}
                      >
                        {s.title}
                      </span>
                    </label>
                    <button
                      onClick={() => handleRemoveSubtask(s.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {task.subtasks.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Nenhuma subtarefa adicionada.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'e2ee' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-200">
                    Criptografia de Ponta a Ponta (AES-256)
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Metadados confidenciais gravados nesta aba são criptografados no navegador antes
                    de serem persistidos. Sem a chave privada empresarial, os dados permanecem
                    ilegíveis.
                  </p>
                </div>
              </div>

              {task.encryptedNote ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Payload Cifrado Gravado
                    </span>
                    <button
                      onClick={handleDecryptNote}
                      disabled={isDecrypting}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{isDecrypting ? 'Decriptando...' : 'Decriptar Nota'}</span>
                    </button>
                  </div>

                  <p className="font-mono text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded break-all">
                    {task.encryptedNote}
                  </p>

                  {e2eeDecryptedText && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-xs font-bold text-emerald-400 mb-1">
                        Conteúdo Descriptografado com Sucesso:
                      </p>
                      <p className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded leading-relaxed">
                        {e2eeDecryptedText}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Add / Update confidential note */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  {task.encryptedNote ? 'Substituir Nota Criptografada' : 'Gravar Nova Nota Confidencial'}
                </label>
                <textarea
                  rows={3}
                  value={e2eeInputText}
                  onChange={(e) => setE2EEInputText(e.target.value)}
                  placeholder="Digite informações confidenciais (ex: senhas temporárias, termos LGPD, dados restritos)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleSaveEncryptedNote}
                  disabled={!e2eeInputText.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Criptografar e Salvar</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai_logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Histórico de Resoluções por Agentes de IA</span>
                </h4>
                {isAgent && checkPermission('AI_TRIGGER_RUN') && (
                  <button
                    onClick={handleTriggerAI}
                    disabled={isExecutingAI}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Disparar Nova Execução</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {task.aiExecutionHistory && task.aiExecutionHistory.length > 0 ? (
                  task.aiExecutionHistory.map((h, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-900 pb-2">
                        <span className="font-semibold text-purple-300">
                          Agente: {h.agentName}
                        </span>
                        <span className="font-mono">
                          {h.timestamp.replace('T', ' ').slice(0, 19)}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed pt-1">
                        {h.log}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                    Nenhuma execução autônoma registrada para esta tarefa ainda. Atribua a um agente
                    de IA e clique em "Executar com IA" para gerar entregáveis.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Criado em: {task.createdAt?.slice(0, 10)}
          </span>
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
