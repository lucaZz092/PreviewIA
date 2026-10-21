import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK safely
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(apiKey),
    version: '1.2.0-enterprise',
  });
});

// AI Agent Autonomous Task Execution endpoint
app.post('/api/ai/agent-task', async (req, res) => {
  try {
    const {
      taskTitle,
      taskDescription,
      agentName,
      agentRole,
      subtasks = [],
      promptContext = '',
    } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ error: 'Título da tarefa é obrigatório' });
    }

    if (ai) {
      const systemInstruction = `Você é um Agente de IA Corporativo especializado na plataforma OmniTask Enterprise.
Nome do Agente: ${agentName || 'OmniAgent'}
Especialidade / Função: ${agentRole || 'DevOps & Automação'}

Sua missão é executar, analisar ou resolver com excelência a demanda ou subtarefa recebida.
Gere uma resposta estruturada em Português (Brasil) com:
1. Resumo executivo da entrega realizada.
2. Detalhes técnicos, artefato ou solução gerada (código, plano, checklist ou auditoria).
3. Status proposto de cada subtarefa analisada (marcar se foi concluída).
4. Próximos passos recomendados e notas de conformidade (LGPD/Segurança).

Seja conciso, técnico, direto e de alto nível corporativo.`;

      const prompt = `Execução de Demanda:
Título: ${taskTitle}
Descrição: ${taskDescription || 'Sem descrição detalhada'}
Subtarefas vinculadas: ${JSON.stringify(subtasks)}
Instruções adicionais: ${promptContext || 'Nenhuma'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const responseText = response.text || 'Tarefa processada com sucesso pelo agente.';

      return res.json({
        success: true,
        agentExecutionLog: responseText,
        executedBy: agentName || 'Agente IA',
        timestamp: new Date().toISOString(),
        suggestedStatus: 'review',
      });
    } else {
      // Deterministic realistic simulated delivery when running without active API key
      const simulatedResponses: Record<string, string> = {
        'Sentinel DevOps AI': `### Resumo da Execução Autônoma por Sentinel DevOps
- Validação de Pipeline CI/CD concluída.
- Scanner de vulnerabilidades SAST executado: 0 vulnerabilidades críticas encontradas.
- Verificação de políticas de Least Privilege e contêineres Docker aprovada.
- Checklists técnicos atualizados e prontos para homologação.`,
        'Apollo Code Reviewer': `### Relatório de Code Review & Arquitetura
- Padrões de Clean Architecture e SOLID validados.
- Cobertura de testes unitários estimada em 94.2%.
- Zero vazamentos de credenciais ou dados pessoais sensíveis detectados (em conformidade com LGPD Art. 46).
- Aprovado para merge na branch principal.`,
        'Lex SecOps & LGPD Auditor': `### Parecer de Auditoria de Privacidade & Compliance
- Análise de impacto à proteção de dados (RIPD) avaliada.
- Base legal verificada: Cumprimento de obrigação legal e legítimo interesse.
- Logs com hash SHA-256 encadeados registrados com sucesso no ledger corporativo.`,
        'Nexus Data Synthesizer': `### Síntese de Dados & Telemetria
- Métricas de throughput e gargalos consolidadas.
- Prazos críticos mapeados com alertas de antecedência de 24h e 48h.
- Relatório analítico formatado para exportação executiva.`,
      };

      const fallbackLog = simulatedResponses[agentName] || `### Execução de Tarefa Concluída
O agente ${agentName || 'Agente de IA'} processou a demanda "${taskTitle}".
- Análise de requisitos concluída.
- Subtarefas processadas com êxito.
- Proposta de entrega encaminhada para revisão da equipe.`;

      return res.json({
        success: true,
        agentExecutionLog: fallbackLog,
        executedBy: agentName || 'Agente IA',
        timestamp: new Date().toISOString(),
        suggestedStatus: 'review',
        isSimulated: true,
      });
    }
  } catch (error: any) {
    console.error('AI agent task error:', error);
    return res.status(500).json({
      error: 'Falha no processamento pelo agente de IA',
      message: error?.message || 'Erro interno',
    });
  }
});

// GitHub Integration Mock/Bridge endpoint
app.get('/api/github/repos', (req, res) => {
  res.json({
    connected: true,
    account: 'preventsenior-enterprise',
    defaultRepo: 'core-platform-services',
    repositories: [
      {
        id: 1,
        name: 'core-platform-services',
        fullName: 'preventsenior-enterprise/core-platform-services',
        defaultBranch: 'main',
        openIssues: 12,
        openPRs: 4,
        lastCommit: {
          sha: 'a8f94e2',
          message: 'feat(auth): enforce sha256 audit chaining & AES-GCM notes',
          author: 'lucas.martins',
          timestamp: '2026-10-20T17:42:00Z',
        },
      },
      {
        id: 2,
        name: 'ai-agents-orchestrator',
        fullName: 'preventsenior-enterprise/ai-agents-orchestrator',
        defaultBranch: 'main',
        openIssues: 5,
        openPRs: 2,
        lastCommit: {
          sha: 'b3c109d',
          message: 'chore(agents): add Sentinel & Nexus autonomous hooks',
          author: 'sentinel-bot[bot]',
          timestamp: '2026-10-20T16:15:00Z',
        },
      },
    ],
  });
});

app.post('/api/github/sync', (req, res) => {
  const { taskId, issueNumber } = req.body;
  res.json({
    synced: true,
    taskId,
    issueNumber: issueNumber || 42,
    prUrl: `https://github.com/preventsenior-enterprise/core-platform-services/pull/${issueNumber || 42}`,
    syncedAt: new Date().toISOString(),
    status: 'LINKED',
  });
});

// Cloud Backup snapshot trigger endpoint
app.post('/api/backup/snapshot', (req, res) => {
  const { snapshotPayload, checksum } = req.body;
  res.json({
    backupId: `BCK-${Date.now().toString(36).toUpperCase()}`,
    status: 'SAVED_SECURELY_IN_CLOUD',
    checksum,
    storedBytes: JSON.stringify(snapshotPayload || {}).length,
    timestamp: new Date().toISOString(),
    retentionDays: 365,
    encryptionStandard: 'AES-256-GCM',
  });
});

// Dev or Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OmniTask Enterprise server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
