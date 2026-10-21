import React from 'react';
import { useApp } from '../context/AppContext';
import { computeProductivityMetrics } from '../utils/analytics';
import {
  TrendingUp,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenTaskModal: (taskId: string) => void;
  onOpenNewTask: () => void;
  onOpenAgentSquad: () => void;
  onOpenAuditLog: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTaskModal,
  onOpenNewTask,
  onOpenAgentSquad,
  onOpenAuditLog,
}) => {
  const { tasks, teamMembers, auditLogs, setActiveView } = useApp();

  const metrics = computeProductivityMetrics(
    tasks.map(t => {
      const member = teamMembers.find(m => m.id === t.assignedToId);
      return {
        ...t,
        assignedTo: {
          id: t.assignedToId,
          name: member?.name || 'Membro',
          avatar: member?.avatar,
          isAI: Boolean(member?.isAI),
          role: member?.role || 'Executor',
        },
      };
    })
  );

  const criticalAndOverdue = tasks.filter(t => {
    const due = new Date(`${t.dueDate}T23:59:59`).getTime();
    const now = Date.now();
    const diffHours = (due - now) / (1000 * 60 * 60);
    return t.status !== 'completed' && diffHours <= 48;
  });

  const aiAgents = teamMembers.filter(m => m.isAI);
  const humanMembers = teamMembers.filter(m => !m.isAI);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Painel Analítico de Produtividade & Governança
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>OmniTask Enterprise</span>
            <span aria-hidden="true">·</span>
            <span>Monitoramento em Tempo Real</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">Conformidade LGPD & GDPR Ativa</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAgentSquad}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Ver Squad de IA</span>
          </button>
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-md shadow-indigo-600/20"
          >
            <Zap className="w-4 h-4" />
            <span>Delegar Nova Demanda</span>
          </button>
        </div>
      </div>

      {/* Critical SLA Notification Alert Banner */}
      {criticalAndOverdue.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-200">
                Alerta de Prazos Críticos: {criticalAndOverdue.length} demandas necessitam atenção
                imediata
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Existem tarefas vencidas ou com entrega programada para as próximas 48 horas. Você
                pode delegar subtarefas para os agentes de IA acelerarem a entrega.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('kanban')}
            className="text-xs font-semibold text-amber-200 hover:text-white bg-amber-900/60 hover:bg-amber-800/80 px-3 py-1.5 rounded-lg border border-amber-700/50 transition-colors whitespace-nowrap shrink-0"
          >
            Ver no Quadro
          </button>
        </div>
      )}

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Taxa de Conclusão */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Taxa de Conclusão</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {metrics.overallCompletionRate}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {metrics.completedTasks}/{metrics.totalTasks}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.overallCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Demandas em Execução */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Em Andamento</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {metrics.inProgressTasks + metrics.aiExecutingTasks}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">demandas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {metrics.aiExecutingTasks} tarefas com IA autônoma
          </p>
        </div>

        {/* Participação de Agentes IA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Carga dos Agentes IA</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-purple-300">
              {metrics.aiTaskSharePercentage}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">das tarefas</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.aiTaskSharePercentage}%` }}
            />
          </div>
        </div>

        {/* Prazos Críticos / Atrasados */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">SLAs em Risco</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              {metrics.overdueTasks + metrics.criticalTasks}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">urgentes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {metrics.overdueTasks} expirados · {metrics.criticalTasks} vencem hoje
          </p>
        </div>

        {/* Eficiência & Horas Poupadas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Horas Otimizadas</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-teal-300">
              +{metrics.hoursEfficiencyDelta}h
            </span>
            <span className="text-[11px] text-slate-400 font-mono">economia</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Estimado: {metrics.totalEstimatedHours}h · Real: {metrics.totalActualHours}h
          </p>
        </div>
      </div>

      {/* Main Grid: Workload Distribution & Critical Delivery Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent Deliveries (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">
                Fila de Entregas & Status em Tempo Real
              </h2>
            </div>
            <button
              onClick={() => setActiveView('list')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {tasks.slice(0, 5).map(task => {
              const member = teamMembers.find(m => m.id === task.assignedToId);
              const isUrgent = task.priority === 'urgent' || task.priority === 'high';
              const completedSubs = task.subtasks.filter(s => s.completed).length;

              return (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskModal(task.id)}
                  className="py-3 px-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-indigo-400">
                        {task.code}
                      </span>
                      {isUrgent && (
                        <span className="text-[10px] text-rose-400 font-medium">Urgente</span>
                      )}
                      {task.isEncrypted && (
                        <span className="text-[10px] text-amber-400 font-mono">E2EE</span>
                      )}
                      {task.githubIssueNumber && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          GH #{task.githubIssueNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-200 truncate mt-1">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Prazo: {task.dueDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Subtarefas: {completedSubs}/{task.subtasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Assignee & Status Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-300">
                        {member?.name || 'Não atribuído'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {member?.isAI ? 'Agente de IA' : 'Colaborador'}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-md capitalize ${
                        task.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : task.status === 'ai_executing'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/60 animate-pulse'
                          : task.status === 'in_progress'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Agents Squad & Workload Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">Squad de Agentes de IA</h2>
            </div>
            <button
              onClick={onOpenAgentSquad}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Gerenciar
            </button>
          </div>

          <div className="space-y-3">
            {aiAgents.map(agent => {
              const workload = metrics.agentWorkload[agent.id] || { assigned: 0, completed: 0 };
              return (
                <div
                  key={agent.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {agent.avatar ? (
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-9 h-9 rounded-lg object-cover border border-purple-500/30"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-300">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-200 truncate">{agent.name}</p>
                        <span className="text-[10px] text-emerald-400 font-mono">Disponível</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{agent.role}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Demandas Atribuídas:</span>
                    <span className="font-mono text-slate-200 font-semibold tabular-nums">
                      {workload.assigned} ({workload.completed} concluídas)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Cryptographic Ledger Link */}
          <div className="pt-2 border-t border-slate-800">
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">Ledger Imutável SHA-256</span>
              </div>
              <button
                onClick={onOpenAuditLog}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
              >
                {auditLogs.length} logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
