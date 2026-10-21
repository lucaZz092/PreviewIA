import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority } from '../types';
import { X, Plus, Bot, User, Lock, Calendar, Trash2 } from 'lucide-react';

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
  const [tags, setTags] = useState('segurança, infra');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptedNote, setEncryptedNote] = useState('');

  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: 'sub-init-1', title: 'Definição e mapeamento de requisitos', completed: false },
    { id: 'sub-init-2', title: 'Implementação e validação técnica', completed: false },
  ]);
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
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      subtasks,
      isEncrypted,
      encryptedNote: isEncrypted && encryptedNote ? `ENC_FALLBACK:${btoa(encryptedNote)}` : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Criar Nova Demanda / Tarefa</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Título da Tarefa <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Refatorar pipeline CI/CD com verificação de vulnerabilidades..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Descrição e Objetivos</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o escopo, requisitos de negócio e critérios de homologação..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Projeto Vinculado</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">
                Responsável (Humano ou Agente IA)
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
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
                <optgroup label="Equipe Técnica">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente (SLA Crítico)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Status Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="ai_executing">Execução IA</option>
                <option value="review">Em Revisão</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Prazo de Entrega</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300">
              Critérios de Aceitação & Subtarefas
            </label>
            <div className="flex gap-2">
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
                placeholder="Adicionar critério ou entrega intermediária..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSub}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg"
              >
                Adicionar
              </button>
            </div>

            <div className="space-y-1.5 mt-2">
              {subtasks.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800 text-xs"
                >
                  <span className="text-slate-300">{s.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSub(s.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* E2EE Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEncrypted}
                onChange={(e) => setIsEncrypted(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Ativar Proteção Criptográfica E2EE (AES-256)</span>
              </span>
            </label>
            {isEncrypted && (
              <textarea
                rows={2}
                value={encryptedNote}
                onChange={(e) => setEncryptedNote(e.target.value)}
                placeholder="Insira dados confidenciais a serem cifrados de ponta a ponta..."
                className="w-full bg-slate-950 border border-amber-800/60 rounded-lg p-2.5 text-xs text-slate-200 mt-2 focus:outline-none"
              />
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-indigo-600/20"
            >
              Salvar Demanda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
