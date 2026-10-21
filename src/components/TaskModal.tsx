import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus } from '../types';
import { Trash2 } from 'lucide-react';
import { encryptE2EE, decryptE2EE } from '../utils/crypto';
import { Modal, Field, fieldClass, textareaClass, primaryButton, secondaryButton, linkButton } from './Modal';
import { STATUS_LABEL, STATUS_ORDER } from './status';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    updateTask,
    deleteTask,
    teamMembers,
    executeAIAgentOnTask,
    checkPermission,
    e2eeSecretKey,
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isExecutingAI, setIsExecutingAI] = useState(false);
  const [e2eeDecryptedText, setE2EEDecryptedText] = useState<string | null>(null);
  const [e2eeInputText, setE2EEInputText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const assignedMember = teamMembers.find(m => m.id === task.assignedToId);
  const isAgent = Boolean(assignedMember?.isAI);
  const canRunAI = isAgent && checkPermission('AI_TRIGGER_RUN');
  const history = task.aiExecutionHistory || [];

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    updateTask({
      ...task,
      subtasks: [...task.subtasks, { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }],
    });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    updateTask({ ...task, subtasks: task.subtasks.map(s => (s.id === subId ? { ...s, completed: !s.completed } : s)) });
  };

  const handleRemoveSubtask = (subId: string) => {
    updateTask({ ...task, subtasks: task.subtasks.filter(s => s.id !== subId) });
  };

  const handleTriggerAI = async () => {
    setIsExecutingAI(true);
    await executeAIAgentOnTask(task.id);
    setIsExecutingAI(false);
  };

  const handleDecryptNote = async () => {
    if (!task.encryptedNote) return;
    setIsDecrypting(true);
    setE2EEDecryptedText(await decryptE2EE(task.encryptedNote, e2eeSecretKey));
    setIsDecrypting(false);
  };

  const handleSaveEncryptedNote = async () => {
    if (!e2eeInputText.trim()) return;
    const cipher = await encryptE2EE(e2eeInputText, e2eeSecretKey);
    updateTask({ ...task, isEncrypted: true, encryptedNote: cipher });
    setE2EEDecryptedText(e2eeInputText);
    setE2EEInputText('');
  };

  const handleDelete = async () => {
    if (confirm('Excluir esta tarefa?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  const completedSubs = task.subtasks.filter(s => s.completed).length;

  return (
    <Modal
      size="lg"
      onClose={onClose}
      title={
        <input
          aria-label="Título"
          value={task.title}
          onChange={(e) => updateTask({ ...task, title: e.target.value })}
          className="w-full bg-transparent text-lg font-semibold text-neutral-900 focus:outline-none"
        />
      }
      footer={
        <>
          {checkPermission('TASK_DELETE') && (
            <button onClick={handleDelete} className="mr-auto flex items-center gap-1.5 text-[13px] text-neutral-400 hover:text-red-600">
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>
          )}
          {task.githubPrUrl && (
            <a href={task.githubPrUrl} target="_blank" rel="noreferrer" className={`${linkButton} mr-3`}>
              PR #{task.githubIssueNumber}
            </a>
          )}
          <button onClick={onClose} className={secondaryButton}>Fechar</button>
        </>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Status">
            <select
              value={task.status}
              disabled={!checkPermission('TASK_EDIT')}
              onChange={(e) => updateTask({ ...task, status: e.target.value as TaskStatus })}
              className={fieldClass}
            >
              {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </Field>
          <Field label="Responsável">
            <select
              value={task.assignedToId}
              onChange={(e) => updateTask({ ...task, assignedToId: e.target.value })}
              className={fieldClass}
            >
              <optgroup label="Pessoas">
                {teamMembers.filter(m => !m.isAI).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
              <optgroup label="Agentes">
                {teamMembers.filter(m => m.isAI).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            </select>
          </Field>
          <Field label="Prazo">
            <input
              type="date"
              value={task.dueDate}
              onChange={(e) => updateTask({ ...task, dueDate: e.target.value })}
              className={fieldClass}
            />
          </Field>
        </div>

        <textarea
          aria-label="Descrição"
          rows={4}
          value={task.description}
          onChange={(e) => updateTask({ ...task, description: e.target.value })}
          placeholder="Adicione uma descrição"
          className={textareaClass}
        />

        <section>
          <h3 className="mb-2 text-[13px] font-medium text-neutral-900">
            Checklist {task.subtasks.length > 0 && <span className="font-normal text-neutral-400">{completedSubs}/{task.subtasks.length}</span>}
          </h3>
          <ul>
            {task.subtasks.map(s => (
              <li key={s.id} className="group flex items-center gap-3 py-1.5">
                <input
                  type="checkbox"
                  checked={s.completed}
                  onChange={() => handleToggleSubtask(s.id)}
                  className="w-4 h-4 rounded border-neutral-300"
                />
                <span className={`flex-1 text-[13px] ${s.completed ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>{s.title}</span>
                <button
                  onClick={() => handleRemoveSubtask(s.id)}
                  aria-label="Remover"
                  className="p-1 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            placeholder="Adicionar item e pressionar Enter"
            className="mt-1 w-full py-1.5 bg-transparent text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
        </section>

        {(canRunAI || history.length > 0) && (
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-[13px] font-medium text-neutral-900">Execuções do agente</h3>
              {canRunAI && (
                <button onClick={handleTriggerAI} disabled={isExecutingAI} className={linkButton}>
                  {isExecutingAI ? 'Executando…' : `Executar com ${assignedMember?.name.split(' ')[0]}`}
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-[13px] text-neutral-400">Nenhuma execução ainda.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="rounded-lg bg-neutral-50 p-4">
                    <p className="mb-2 text-xs text-neutral-500">
                      {h.agentName} · {new Date(h.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-neutral-800">{h.log}</pre>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <details className="group" open={Boolean(task.encryptedNote) || undefined}>
          <summary className="cursor-pointer list-none text-[13px] font-medium text-neutral-900">
            Nota confidencial <span className="font-normal text-neutral-400 group-open:hidden">· criptografada no navegador</span>
          </summary>
          <div className="mt-3 space-y-3">
            {task.encryptedNote && (
              e2eeDecryptedText ? (
                <p className="rounded-lg bg-neutral-50 p-3 text-[13px] text-neutral-800">{e2eeDecryptedText}</p>
              ) : (
                <button onClick={handleDecryptNote} disabled={isDecrypting} className={secondaryButton}>
                  {isDecrypting ? 'Abrindo…' : 'Ver nota'}
                </button>
              )
            )}
            <textarea
              rows={2}
              value={e2eeInputText}
              onChange={(e) => setE2EEInputText(e.target.value)}
              placeholder={task.encryptedNote ? 'Substituir nota' : 'Escreva algo confidencial'}
              className={textareaClass}
            />
            {e2eeInputText.trim() && (
              <button onClick={handleSaveEncryptedNote} className={primaryButton}>Salvar nota</button>
            )}
          </div>
        </details>
      </div>
    </Modal>
  );
};
