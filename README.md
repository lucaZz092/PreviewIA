# OmniTask

Aplicação de gestão de trabalho com projetos, demandas, responsáveis humanos e agentes de IA. A interface usa uma área de trabalho clara, navegação lateral por projetos, abas de visualização e status coloridos, inspirados na organização do monday.com, preservando a identidade OmniTask.

## Executar localmente

Requisitos: Node.js 22.12 ou superior e npm. O servidor Express entrega a API e o frontend no mesmo endereço.

```bash
npm install
cp .env.example .env
npm run dev
```

Acesse `http://localhost:3000`. Sem chave do Gemini, a execução dos agentes retorna resultados demonstrativos. Os dados iniciais de projetos, pessoas e tarefas estão em `src/context/AppContext.tsx`.

### Configuração

| Variável | Uso |
| --- | --- |
| `GEMINI_API_KEY` | Opcional. Chave do Google Gemini, lida apenas pelo servidor. Deixe vazia para simulação. |
| `PORT` | Porta HTTP; padrão `3000`. |
| `NODE_ENV` | Use `production` para servir o frontend compilado em `dist`. |
| `APP_URL` | Prevista no arquivo de exemplo; atualmente não é consumida pelo código. |
| `DISABLE_HMR` | Desativa HMR e observação de arquivos do Vite quando `true`. |

O modelo Gemini está definido em `server.ts` como `gemini-3.8-flash`. Antes de habilitar chamadas reais, confira sua disponibilidade na conta/projeto e ajuste o identificador caso necessário.

### Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Express com Vite em modo de desenvolvimento. |
| `npm run lint` | Verificação de tipos com TypeScript; não executa ESLint. |
| `npm test` | Testes existentes das regras de negócio e utilitários. |
| `npm run build` | Compila o frontend em `dist`. |
| `npm start` | Inicia o Express; respeita `NODE_ENV`. |
| `npm run preview` | Prévia estática do Vite; não inicia os endpoints da API. |

Para executar o build com a API:

```bash
npm run build
NODE_ENV=production npm start
```

## Funcionalidades

- **Área de trabalho:** navegação por grupos e projetos, criação de grupos/projetos, abas de visão geral, quadro principal, Kanban e cronograma; menu lateral adaptado para celular.
- **Demandas:** criação, detalhes, alteração de status, exclusão conforme o perfil, atribuição de responsáveis, prioridades, prazo, estimativa e horas realizadas, tags e subtarefas.
- **Quadro principal:** filtros por projeto/grupo, status e prioridade; busca por código, título, descrição e tags; ordenação por código, prazo e prioridade; edição do status na tabela.
- **Kanban:** seis etapas — backlog, a fazer, em andamento, execução IA, revisão e concluído. Movimentação pelos controles dos cartões; não há implementação de arrastar e soltar.
- **Visão geral:** indicadores de conclusão, tarefas em andamento, participação de IA, prazos em risco, horas e distribuição de trabalho; acesso aos detalhes das demandas.
- **Cronograma:** cartões por projeto com datas, percentual concluído e entregas vinculadas. Não implementa um gráfico Gantt interativo nem cálculo de dependências.
- **Agentes:** equipe demonstrativa com especialidades, atribuição de tarefas e envio de título, descrição e subtarefas para execução textual assistida; histórico do resultado na demanda e encaminhamento para revisão. Não executa pipelines, comandos ou mudanças em repositórios.
- **Notificações:** alertas locais relacionados a prazos e agentes, leitura e limpeza da lista; sem envio de e-mail ou push.
- **Relatórios:** exportação de demandas em CSV e relatório executivo para impressão/salvamento em PDF pelo navegador.
- **Perfis de acesso:** simulação de ADMIN, MANAGER, AI_OPERATOR, MEMBER, AUDITOR e GUEST, com matriz de permissões configurável na sessão.
- **Auditoria:** registro de ações, encadeamento de hashes e verificação de integridade, com recursos de consulta e exportação.
- **Privacidade:** ferramentas demonstrativas de retenção, anonimização e exportação de dossiê do titular em JSON.
- **Notas e backup local:** criptografia de notas com Web Crypto quando disponível e download de snapshot criptografado em JSON.

## Integrações e estado real

| Integração | Implementação atual | Necessário para uso real |
| --- | --- | --- |
| Google Gemini | Chamada pelo SDK `@google/genai` no servidor quando há chave. Sem chave, resposta determinística simulada, identificada pela API com `isSimulated`. | Chave válida, modelo disponível, revisão dos dados enviados e tratamento operacional. |
| GitHub | Listagem fixa de repositórios e simulação de vínculo de issue/PR. As rotas não chamam a API do GitHub. | Implementar autenticação, API, permissões e, se necessário, webhooks. |
| Backup em nuvem | O endpoint recebe o snapshot e devolve metadados; não armazena o conteúdo em disco, banco ou provedor de nuvem. | Implementar armazenamento, criptografia, autenticação, retenção e restauração. |
| Criptografia local | Utilitários de SHA-256 e AES-GCM no navegador; exportação local cifrada. | Gestão adequada de chaves e remoção dos fallbacks demonstrativos antes de uso sensível. |
| Google Fonts | Carregamento externo de Inter e JetBrains Mono, com fontes locais de fallback. | Opcionalmente hospedar as fontes para funcionamento sem dependência externa. |

O monday.com é referência de interface; não há integração com sua API.

## API

Todas as rotas estão em `server.ts` e usam JSON.

| Método | Rota | Entrada / resultado |
| --- | --- | --- |
| GET | `/api/health` | Estado, timestamp, versão e indicação de chave IA configurada. |
| POST | `/api/ai/agent-task` | Recebe `taskTitle` (obrigatório), `taskDescription`, `agentName`, `agentRole`, `subtasks` e `promptContext`. Retorna texto do agente e status sugerido `review`. |
| GET | `/api/github/repos` | Retorna conta e repositórios de demonstração. |
| POST | `/api/github/sync` | Recebe `taskId` e `issueNumber`; retorna vínculo simulado. |
| POST | `/api/backup/snapshot` | Recebe `snapshotPayload` e `checksum`; retorna metadados simulados do snapshot. |

Exemplo de verificação com o servidor iniciado:

```bash
curl http://localhost:3000/api/health
```

## Arquitetura

```text
server.ts                     Express, API e entrega do frontend
src/App.tsx                   Composição da aplicação e modais
src/context/AppContext.tsx    Estado compartilhado e operações
src/components/               Telas, navegação e formulários
src/types/                    Tipos de domínio
src/utils/                    Métricas, relatórios, privacidade, RBAC e criptografia
src/index.css                 Tema, tabela, acessibilidade e impressão
vite.config.ts                Vite, React e Tailwind CSS
```

Stack: React 19, TypeScript, Vite, Tailwind CSS 4, Express, Lucide React, Motion e SDK Google GenAI. O frontend usa Context e estado React; não há banco de dados nem persistência automática. Recarregar a página restaura os dados iniciais e perde alterações da sessão. O backup local permite exportar dados, mas não existe fluxo de restauração implementado.

## Limites para produção

O projeto é um protótipo funcional com dados demonstrativos. A troca de perfil ocorre no cliente, sem login ou autorização no servidor. As APIs não implementam autenticação, controle de acesso, limitação de requisições ou validação completa de payloads.

O registro de auditoria fica em memória no navegador; o encadeamento de hashes não equivale a armazenamento imutável. Os utilitários de criptografia possuem fallbacks demonstrativos de hash e Base64, e a chave inicial está definida no cliente. O snapshot enviado ao endpoint de nuvem não é cifrado pelo fluxo atual. As telas de privacidade e os rótulos existentes não comprovam conformidade com LGPD/GDPR.

Antes de armazenar dados reais, são necessários persistência, autenticação e autorização no servidor, validação de entrada, gestão de segredos, criptografia sem fallback inseguro, armazenamento e restauração de backup, auditoria persistente e revisão das políticas de privacidade.

## Referências visuais

A adaptação usa organização por workspace e projetos, alternância de visualizações e cores semânticas para acompanhar entregas:

- [Estrutura dos quadros no monday.com](https://support.monday.com/hc/en-us/articles/115005317249-The-basics-of-a-board)
- [Coluna de status no monday.com](https://support.monday.com/hc/en-us/articles/360001269685-The-Status-Column)
