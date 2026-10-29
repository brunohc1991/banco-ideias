# Proposal

## Why

O dashboard hoje é só um espaço "Em construção". Quem entra no sistema quer ver, de relance, quantas ideias, tipos e processamentos já tem, o que mudou por último e como foi a atividade da semana, e ter à mão os atalhos para as ações mais comuns.

## What Changes

- Novo endpoint autenticado `GET /dashboard/summary` que devolve, numa única resposta, as contagens de Ideias, Tipos de Ideia e Processamentos do usuário, as últimas Ideias atualizadas e a atividade dos últimos 7 dias.
- Novas consultas enxutas de leitura nos repositórios de Ideia, Tipo de Ideia e Processamento (contagens, últimas Ideias e contagem diária), sem nova migration.
- O dashboard passa a mostrar: três cards de estatísticas, uma faixa de acesso rápido (nova ideia, novo tipo, novo processamento), um gráfico dos últimos 7 dias (barras de processamentos e linha de ideias criadas) e a lista das últimas ideias atualizadas, com estados de carregamento, vazio e erro.
- **BREAKING**: o dashboard deixa de ser um espaço reservado sem dados; o requisito "Rota de Dashboard" é substituído.
- Reaproveita os componentes compartilhados de card de métrica, gráfico de barras e linha, cabeçalho de seção e estado vazio.
- Fora de escopo: filtros ou janela configurável do gráfico, outros gráficos, lista de Processamentos, ajuste de fuso do usuário e cache.

## Capabilities

### New Capabilities
- `dashboard-summary`: resumo de leitura do dashboard (contagens, últimas Ideias e atividade de 7 dias) exposto como endpoint autenticado e isolado por usuário.

### Modified Capabilities
- `app-dashboard`: a página `/dashboard` deixa de ser um espaço reservado e passa a exibir a visão geral.

## Impact

- `modules/ideas`: novo agregado somente de leitura `dashboard` (tipos de leitura e caso de uso `LoadDashboardSummary`), novos métodos nos três repositórios e nos fakes, testes.
- `apps/backend`: implementação Prisma dos novos métodos, `dashboard.controller.ts` e `dashboard.integration.http`.
- `apps/frontend`: tipos, API, cinco componentes do dashboard e a página `/dashboard`.
- Sem nova tabela, migration nem dependência (o gráfico e os cards já existem no kit compartilhado).
- Depende de `add-ideas` e `add-idea-processing` (ainda não aplicadas), pois usa Ideias, Processamentos e suas rotas de criação.
- Origem do requisito: `.docs/012-dashboard/spec.md`.
