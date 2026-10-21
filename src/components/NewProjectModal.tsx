import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, FolderPlus, Plus } from 'lucide-react';

interface NewProjectModalProps {
  onClose: () => void;
  isGroupOnly?: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  onClose,
  isGroupOnly = false,
}) => {
  const { createProject, createProjectGroup, projectGroups } = useApp();

  const [mode, setMode] = useState<'project' | 'group'>(isGroupOnly ? 'group' : 'project');

  // Group fields
  const [groupName, setGroupName] = useState('');
  const [department, setDepartment] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Project fields
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projGroupId, setProjGroupId] = useState(projectGroups[0]?.id || 'grp-tech');
  const [projDesc, setProjDesc] = useState('');
  const [startDate, setStartDate] = useState('2026-10-20');
  const [targetDate, setTargetDate] = useState('2026-12-15');
  const [budgetHours, setBudgetHours] = useState(160);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'group') {
      if (!groupName.trim()) return;
      await createProjectGroup({
        name: groupName.trim(),
        department: department.trim() || 'Geral',
        description: groupDesc.trim(),
        leadId: 'usr-lucas',
      });
    } else {
      if (!projName.trim() || !projCode.trim()) return;
      await createProject({
        groupId: projGroupId,
        code: projCode.trim().toUpperCase(),
        name: projName.trim(),
        description: projDesc.trim(),
        status: 'active',
        startDate,
        targetDate,
        budgetHours: Number(budgetHours) || 80,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              {mode === 'group' ? 'Criar Novo Grupo de Projetos' : 'Criar Novo Projeto'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        {!isGroupOnly && (
          <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50/40">
            <button
              onClick={() => setMode('project')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                mode === 'project'
                  ? 'text-blue-600 border-b-2 border-indigo-500 bg-white/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Novo Projeto
            </button>
            <button
              onClick={() => setMode('group')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                mode === 'group'
                  ? 'text-blue-600 border-b-2 border-indigo-500 bg-white/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Novo Grupo de Entregas
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'group' ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Nome do Grupo Estratégico <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Operações Clínicas & Eficiência..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Departamento</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Tecnologia / Jurídico / Auditoria"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Descrição</label>
                <textarea
                  rows={3}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Finalidade e escopo de atuação do grupo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Nome do Projeto <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="Ex: Auditoria de Segurança CI/CD"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Código <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={projCode}
                    onChange={(e) => setProjCode(e.target.value)}
                    placeholder="EX: SEC-03"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Grupo Pertencente</label>
                <select
                  value={projGroupId}
                  onChange={(e) => setProjGroupId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 focus:outline-none focus:border-indigo-500"
                >
                  {projectGroups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Data Limite (SLA)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Orçamento de Horas (Estimativa)
                </label>
                <input
                  type="number"
                  value={budgetHours}
                  onChange={(e) => setBudgetHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 mt-1 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
