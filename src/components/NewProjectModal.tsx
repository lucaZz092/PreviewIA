import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Field, Tabs, fieldClass, textareaClass, primaryButton, secondaryButton } from './Modal';

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
    <Modal
      size="sm"
      title={mode === 'group' ? 'Novo grupo' : 'Novo projeto'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButton}>Cancelar</button>
          <button type="submit" form="new-project-form" className={primaryButton}>Criar</button>
        </>
      }
    >
      {!isGroupOnly && (
        <div className="mb-5">
          <Tabs
            tabs={[{ id: 'project', label: 'Projeto' }, { id: 'group', label: 'Grupo' }]}
            active={mode}
            onChange={setMode}
          />
        </div>
      )}

      <form id="new-project-form" onSubmit={handleSubmit} className="space-y-4">
        {mode === 'group' ? (
          <>
            <Field label="Nome">
              <input type="text" required autoFocus value={groupName} onChange={(e) => setGroupName(e.target.value)} className={fieldClass} />
            </Field>
            <Field label="Departamento">
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Opcional" className={fieldClass} />
            </Field>
            <Field label="Descrição">
              <textarea rows={3} value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Opcional" className={textareaClass} />
            </Field>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nome" className="col-span-2">
                <input type="text" required autoFocus value={projName} onChange={(e) => setProjName(e.target.value)} className={fieldClass} />
              </Field>
              <Field label="Código">
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={projCode}
                  onChange={(e) => setProjCode(e.target.value)}
                  placeholder="ABC-01"
                  className={`${fieldClass} uppercase`}
                />
              </Field>
            </div>
            <Field label="Grupo">
              <select value={projGroupId} onChange={(e) => setProjGroupId(e.target.value)} className={fieldClass}>
                {projectGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Início">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={fieldClass} />
              </Field>
              <Field label="Prazo">
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={fieldClass} />
              </Field>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
