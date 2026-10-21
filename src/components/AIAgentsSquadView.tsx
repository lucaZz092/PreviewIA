import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Zap,
  Shield,
  Code2,
  Database,
  CheckCircle,
  Clock,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface AIAgentsSquadViewProps {
  onOpenNewTaskWithAgent: (agentId: string) => void;
  onOpenTaskModal: (taskId: string) => void;
}

export const AIAgentsSquadView: React.FC<AIAgentsSquadViewProps> = ({
  onOpenNewTaskWithAgent,
  onOpenTaskModal,
}) => {
  const { teamMembers, tasks, checkPermission, executeAIAgentOnTask } = useApp();
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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-purple-400" />
            <span>Squad Corporativo de Agentes de IA</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Orquestração e delegação de demandas corporativas para agentes autônomos supervisionados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Gemini 3.8 Flash Ativo</span>
          </span>
        </div>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiAgents.map(agent => {
          const isSelected = selectedAgentId === agent.id;
          const assignedCount = tasks.filter(t => t.assignedToId === agent.id).length;
          const completedCount = tasks.filter(t => t.assignedToId === agent.id && t.status === 'completed').length;

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`p-4 bg-slate-900 border rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-11 h-11 rounded-lg object-cover border border-purple-500/40"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-white truncate">{agent.name}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{agent.role}</p>
                </div>
              </div>

              {/* Badges / Capabilities */}
              <div className="mt-3 flex flex-wrap gap-1">
                {agent.capabilities?.slice(0, 2).map((cap, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded"
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Demandas:</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {assignedCount} ({completedCount} prontas)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Workspace & Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tasks assigned to this agent */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Demandas com {selectedAgent.name}
            </h3>
            <button
              onClick={() => onOpenNewTaskWithAgent(selectedAgent.id)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Delegar Nova</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {agentTasks.map(t => (
              <div
                key={t.id}
                onClick={() => onOpenTaskModal(t.id)}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-mono text-indigo-400 font-semibold">{t.code}</span>
                  <span className="capitalize text-slate-400">{t.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs font-semibold text-slate-200 truncate">{t.title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>Prazo: {t.dueDate}</span>
                  <span className="font-mono">{t.subtasks.filter(s => s.completed).length}/{t.subtasks.length} subs</span>
                </div>
              </div>
            ))}

            {agentTasks.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
                Nenhuma tarefa ativa atribuída a este agente.
              </div>
            )}
          </div>
        </div>

        {/* Right: Autonomous Prompt Console & Execution Output */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Console de Execução Autônoma ({selectedAgent.name})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Modelo: gemini-3.8-flash
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Instrução ou Demanda Imediata para o Agente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAutonomousPrompt()}
                placeholder={`Ex.: Executar verificação de segurança no cluster ou analisar conformidade...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRunAutonomousPrompt}
                disabled={isProcessing || !testPrompt.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Processando...' : 'Executar'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 min-h-[220px] max-h-[320px] overflow-y-auto">
            <div className="text-slate-400 border-b border-slate-900 pb-2 mb-3 flex items-center justify-between">
              <span>// Output de Execução e Logs do Agente</span>
              <span className="text-[10px] text-emerald-400">STATUS: PRONTO</span>
            </div>

            {liveLog ? (
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                {liveLog}
              </pre>
            ) : (
              <div className="text-slate-400 italic">
                Aguardando comando. Digite uma instrução acima e clique em "Executar" para ver a entrega técnica do agente de IA em tempo real.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
