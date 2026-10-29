# Design

## Context

O módulo `ideas` terá, após as changes `add-ideas` e `add-idea-processing`, os repositórios de Ideia, Tipo de Ideia e Processamento com exclusão lógica nas Ideias e Tipos e exclusão física nos Processamentos, e as rotas de criação `/ideas/new`, `/idea-types/new` e `/processings/new`. O dashboard (`/dashboard`) é hoje um espaço reservado. O front-end já tem `MetricCard`, `ComposedBarLineChart`, `PageSectionHeader`, `EmptyListState`, `Card`, `Badge` e `recharts`. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Uma única consulta que alimenta a tela inteira, sem round-trips extras e sem mutação.
- Reaproveitar os componentes compartilhados em vez de criar novos.

**Non-Goals:**
- Filtros ou janela configurável, mais gráficos, lista de Processamentos, fuso do usuário e cache.
- Nova tabela, migration ou índice.

## Decisions

- **Agregado somente de leitura.** `dashboard` no módulo `ideas` guarda só os tipos de leitura e o caso de uso `LoadDashboardSummary`; não tem entidade nem repositório próprio e consome os repositórios dos outros agregados.
- **Consultas enxutas nos repositórios existentes:** `countByUser` (Ideia, Tipo de Ideia e Processamento), `findLatestByUser(userId, limit)` (Ideia, devolvendo um resumo com o nome do tipo, não a Ideia completa) e `countDailyByUser(userId, days)` (Ideia e Processamento). O tipo de contagem diária é definido uma vez e reutilizado. Os fakes acompanham.
- **Seis leituras em paralelo** com `Promise.all`; a normalização da série fica no caso de uso (não no repositório nem no front-end): monta os 7 dias em UTC e preenche com zero os que faltam.
- **Janela fixa de 7 dias** como constante do caso de uso, sem parâmetro. O único parâmetro é `latestLimit` (inteiro de 1 a 20, padrão 5), validado no caso de uso (`dashboard.latestLimit.invalid`); o controller só converte o texto em número e deixa valores inválidos ou não numéricos para o caso de uso.
- **Registros excluídos não contam.** As contagens e a atividade de Ideias e Tipos desconsideram os excluídos logicamente, em coerência com as listagens; o documento de origem não trata disso.
- **Agrupamento diário em UTC** (simplificação aceita do MVP; o ajuste ao fuso do usuário fica para depois).
- **Resposta única** `{ stats, latestIdeas, activity }`, com `updatedAt` em ISO 8601 e `date` em `YYYY-MM-DD`.
- **Front-end.** Componente principal busca o resumo uma vez ao montar; cards com `MetricCard` (cor discreta só no ícone), acesso rápido estático, gráfico com `ComposedBarLineChart` (barras de Processamentos e linha de Ideias criadas, formatador de rótulo de dia em português) e lista das últimas ideias. A página `/dashboard` vira só a chamada do componente principal. Loading por esqueletos; erro por toaster mantendo o esqueleto.
- **Rotas de criação.** Os atalhos apontam para as rotas de criação que as changes anteriores entregam; se alguma não existir na aplicação, o atalho aponta para a listagem correspondente.
- **Contagem de Processamentos.** O card conta Processamentos (não iterações), com o subtítulo "Gerações concluídas" do documento de origem; o texto pode sugerir iterações, e fica como ajuste de redação futuro.
- **Nomes do documento de origem.** Cita `DomainExceptionFilter` e `apiClient`, que não existem; vale o `ApiExceptionFilter` e o padrão de wrappers com `fetch`. O redirecionamento de quem não tem sessão é para `/join`, não `/login`. Os arquivos `.spec/memory/` não existem; a atualização vai para `openspec/memory/modulos.md`.
- **Capabilities.** Um comportamento novo (`dashboard-summary`) e a modificação de `app-dashboard`, que já existe como spec principal e hoje exige um espaço reservado sem dados.

## Risks / Trade-offs

- [Agrupar por dia em UTC desloca criações feitas à noite no Brasil para o dia seguinte] → aceito no MVP e registrado como evolução.
- [Sem cache, cada acesso refaz seis consultas] → são contagens e agrupamentos sobre colunas já indexadas por usuário, de custo baixo.
- [Contagem diária depende de agrupamento por data no Postgres] → usa a abordagem suportada pelo Prisma do projeto, restrita à janela e ao usuário.
- [Aplicação antes das changes das quais depende] → aplicar depois de `add-ideas` e `add-idea-processing`.

## Open Questions

- Nenhuma que mude os requisitos.
