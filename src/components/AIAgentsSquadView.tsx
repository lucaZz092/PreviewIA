import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot } from 'lucide-react';
import { STATUS_DOT, STATUS_LABEL, formatDate } from './status';

interface AIAgentsSquadViewProps {
  onOpenNewTaskWithAgent: (agentId: string) => void;
  onOpenTaskModal: (taskId: string) => void;
}

export const AIAgentsSquadView: React.FC<AIAgentsSquadViewProps> = ({
  onOpenNewTaskWithAgent,
  onOpenTaskModal,
}) => {
  const { teamMembers, tasks, checkPermission } = useApp();
  const [testPrompt, setTestPrompt] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-sentinel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveLog, setLiveLog] = useState<string | null>(null);

  const aiAgents = teamMembers.filter(m => m.isAI);
  const selectedAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

  const agentTasks = tasks.filter(t => t.assignedToId === selectedAgentId);

  const handleRunAutonomousPrompt = async () => {
    if (!testPrompt.trim()) return;
    setIsProcessing(true);
    setLiveLog(null);

    try {
      const res = await fetch('/api/ai/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: testPrompt,
          taskDescription: 'Execução autônoma de teste acionada no Squad de IA.',
          agentName: selectedAgent.name,
          agentRole: selectedAgent.role,
          subtasks: [
            { id: 'sub-t1', title: 'Análise de conformidade e segurança', completed: false },
            { id: 'sub-t2', title: 'Geração de síntese executiva', completed: false },
          ],
        }),
      });
      const data = await res.json();
      setLiveLog(data.agentExecutionLog || 'Execução finalizada com êxito.');
    } catch (err: any) {
      setLiveLog('Erro ao contactar o agente de IA: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-5 md:px-10 py-8 max-w-6xl mx-auto space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Agentes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {aiAgents.map(agent => {
          const isSelected = selectedAgentId === agent.id;
          const assignedCount = tasks.filter(t => t.assignedToId === agent.id && t.status !== 'completed').length;

          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                isSelected ? 'border-neutral-900' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {agent.avatar ? (
                <img src={agent.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <Bot className="w-4 h-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-neutral-900 truncate">{agent.name}</span>
                <span className="block text-xs text-neutral-500 truncate">
                  {assignedCount} {assignedCount === 1 ? 'tarefa aberta' : 'tarefas abertas'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selectedAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <section className="lg:col-span-2">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-sm font-medium text-neutral-900">Tarefas</h2>
              {checkPermission('TASK_CREATE') && (
                <button
                  onClick={() => onOpenNewTaskWithAgent(selectedAgent.id)}
                  className="text-[13px] text-neutral-500 hover:text-neutral-900"
                >
                  Delegar
                </button>
              )}
            </div>
            {agentTasks.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-neutral-500 border-t border-neutral-100">Nenhuma tarefa.</p>
            ) : (
              <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
                {agentTasks.map(t => (
                  <li key={t.id}>
                    <button
                      onClick={() => onOpenTaskModal(t.id)}
                      className="w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md text-left hover:bg-neutral-50 transition-colors"
                    >
                      <span title={STATUS_LABEL[t.status]} className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[t.status]}`} />
                      <span className="flex-1 min-w-0 truncate text-[13px] text-neutral-900">{t.title}</span>
                      <span className="text-[13px] text-neutral-500 tabular-nums">{formatDate(t.dueDate)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="lg:col-span-3">
            <h2 className="text-sm font-medium text-neutral-900 mb-2">Pedir ao {selectedAgent.name.split(' ')[0]}</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAutonomousPrompt()}
                placeholder="Descreva o que precisa"
                className="flex-1 h-9 px-3 rounded-md border border-neutral-200 text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              />
              <button
                onClick={handleRunAutonomousPrompt}
                disabled={isProcessing || !testPrompt.trim()}
                className="h-9 px-4 rounded-md bg-neutral-900 hover:bg-neutral-700 disabled:opacity-40 text-white text-[13px] font-medium transition-colors"
              >
                {isProcessing ? 'Executando…' : 'Executar'}
              </button>
            </div>
            {liveLog && (
              <pre className="mt-4 p-4 rounded-lg bg-neutral-50 whitespace-pre-wrap font-sans text-[13px] text-neutral-800 leading-relaxed max-h-[360px] overflow-y-auto">
                {liveLog}
              </pre>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
