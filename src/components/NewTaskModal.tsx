import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority } from '../types';
import { Trash2 } from 'lucide-react';
import { Modal, Field, fieldClass, textareaClass, primaryButton, secondaryButton } from './Modal';
import { PRIORITY_LABEL, STATUS_LABEL, STATUS_ORDER } from './status';

interface NewTaskModalProps {
  onClose: () => void;
  defaultStatus?: TaskStatus;
  defaultAgentId?: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  onClose,
  defaultStatus = 'todo',
  defaultAgentId,
}) => {
  const { createTask, projectGroups, projects, teamMembers, selectedProjectId } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(
    selectedProjectId || projects[0]?.id || 'prj-cloud'
  );
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [assignedToId, setAssignedToId] = useState(
    defaultAgentId || 'agent-sentinel'
  );
  const [dueDate, setDueDate] = useState('2026-10-25');
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptedNote, setEncryptedNote] = useState('');

  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const handleAddSub = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: `sub-${Date.now()}`, title: newSubtaskInput.trim(), completed: false },
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSub = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const project = projects.find(p => p.id === projectId);
    const projectGroupId = project ? project.groupId : projectGroups[0]?.id || 'grp-tech';

    await createTask({
      title: title.trim(),
      description: description.trim(),
      projectId,
      projectGroupId,
      status,
      priority,
      dueDate,
      assignedToId,
      estimatedHours: Number(estimatedHours) || 4,
      actualHours: 0,
      tags: [],
      subtasks,
      isEncrypted,
      encryptedNote: isEncrypted && encryptedNote ? `ENC_FALLBACK:${btoa(encryptedNote)}` : undefined,
    });

    onClose();
  };

  return (
    <Modal
      title="Nova tarefa"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButton}>Cancelar</button>
          <button type="submit" form="new-task-form" disabled={!title.trim()} className={primaryButton}>Criar tarefa</button>
        </>
      }
    >
      <form id="new-task-form" onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          required
          autoFocus
          aria-label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da tarefa"
          className={fieldClass}
        />

        <textarea
          rows={3}
          aria-label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          className={textareaClass}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Projeto">
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={fieldClass}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Responsável">
            <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className={fieldClass}>
              <optgroup label="Pessoas">
                {teamMembers.filter(m => !m.isAI).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
              <optgroup label="Agentes">
                {teamMembers.filter(m => m.isAI).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Prioridade">
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={fieldClass}>
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={fieldClass}>
              {STATUS_ORDER.filter(s => s !== 'completed').map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </Field>
          <Field label="Prazo">
            <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
          </Field>
        </div>

        <section>
          <h3 className="mb-1 text-xs text-neutral-500">Checklist</h3>
          <ul>
            {subtasks.map(s => (
              <li key={s.id} className="group flex items-center gap-3 py-1.5 text-[13px] text-neutral-800">
                <span className="w-1 h-1 rounded-full bg-neutral-400" />
                <span className="flex-1">{s.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSub(s.id)}
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
            value={newSubtaskInput}
            onChange={(e) => setNewSubtaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSub();
              }
            }}
            placeholder="Adicionar item e pressionar Enter"
            className="w-full py-1.5 bg-transparent text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
        </section>

        <div>
          <label className="flex items-center gap-2 text-[13px] text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isEncrypted}
              onChange={(e) => setIsEncrypted(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300"
            />
            Adicionar nota confidencial
          </label>
          {isEncrypted && (
            <textarea
              rows={2}
              value={encryptedNote}
              onChange={(e) => setEncryptedNote(e.target.value)}
              placeholder="Criptografada antes de salvar"
              className={`${textareaClass} mt-2`}
            />
          )}
        </div>
      </form>
    </Modal>
  );
};
