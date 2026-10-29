# Tasks

## 1. Domínio (módulo `ideas`)

- [x] 1.1 Criar o agregado somente de leitura `dashboard` (`module-aggregate`) com os tipos de leitura do resumo (estatísticas, resumo de Ideia, ponto de atividade e resumo completo), sem repositório próprio, e o tipo de contagem diária compartilhado, exportados pelo módulo. Verificar com `tsc` do módulo limpo.
- [x] 1.2 Evoluir os repositórios (`module-repository`): `countByUser` em Ideia, Tipo de Ideia e Processamento, `findLatestByUser` e `countDailyByUser` em Ideia, e `countDailyByUser` em Processamento, atualizando os três fakes e desconsiderando Ideias e Tipos excluídos. Verificar com os testes existentes dos casos de uso ainda verdes e testes dos fakes para as novas consultas.
- [x] 1.3 Implementar `LoadDashboardSummary` (`module-use-case`): limite padrão 5 validado de 1 a 20 (`dashboard.latestLimit.invalid`), seis leituras em paralelo e normalização da atividade em 7 dias UTC com zeros nos dias vazios. Verificar com testes de dados completos, tudo zerado, dias vazios preenchidos e ordem crescente, limite padrão, 1 e 20 válidos, 0, 21 e 3.5 inválidos e leituras disparadas em paralelo, com cobertura de 100% no caso de uso.

## 2. Back-end

- [x] 2.1 Implementar os novos métodos nos repositórios Prisma existentes (`backend-prisma-repository`): contagens por usuário sem excluídos, últimas Ideias com o nome do tipo e contagem diária por data de criação em UTC restrita à janela e ao usuário, sem migration nova. Verificar com `npx tsc --noEmit` limpo no backend e consultas executando contra o banco.
- [x] 2.2 Criar `dashboard.controller.ts` (`backend-nest-controller`) com `GET /dashboard/summary?latestLimit=`, autenticado, convertendo o limite em número e devolvendo `{ stats, latestIdeas, activity }` com `updatedAt` em ISO, registrado no `IdeasModule`. Verificar com chamadas reais ao backend.
- [x] 2.3 Criar `dashboard.integration.http` com dois usuários e dados prévios: resumo do dono (contagens, ordem das últimas e 7 dias), resumo do outro usuário (isolamento), `latestLimit` 1 e 20, 0 e 21 (422) e sem token (401). Verificar executando os cenários com o backend rodando.
- [x] 2.4 Adicionar `dashboard.latestLimit.invalid` em `messages.pt.ts` e `messages.en.ts`. Verificar com `npx tsc --noEmit` limpo no front-end.

## 3. Front-end

- [x] 3.1 Criar os tipos e o wrapper de API do dashboard (`getDashboardSummary(token, { latestLimit? })`) com o mesmo padrão de erro dos demais. Verificar com `npx tsc --noEmit` limpo.
- [x] 3.2 Criar o acesso rápido (três atalhos para as telas de criação, confirmando que as rotas existem) e o gráfico de atividade (`ComposedBarLineChart` com rótulos de dia em português e espaço reservado durante o carregamento). Verificar no navegador os atalhos e o gráfico com dados e sem dados.
- [x] 3.3 Criar a lista das últimas ideias (esqueleto, estado vazio com "Nova Ideia" e itens com link, tipo e data). Verificar no navegador com e sem ideias.
- [x] 3.4 Criar o componente principal do dashboard (cabeçalho, três `MetricCard` com ícone de tom discreto e esqueleto, e os blocos anteriores, com toaster de erro) e trocar o conteúdo de `/dashboard` por ele. Verificar no navegador que os números batem com `/ideas`, `/idea-types` e `/processings`.

## 4. Memória e validação integrada

- [x] 4.1 Registrar em `openspec/memory/modulos.md` o agregado de leitura `dashboard` do módulo `ideas`. Verificar relendo o arquivo.
- [x] 4.2 Rodar `npx tsc --noEmit` e o build do front-end, o build e os testes do backend e dos módulos, todos sem erros.
- [x] 4.3 Validar no navegador e registrar evidência: números corretos e ícones discretos, atalhos, gráfico de 7 dias com legenda legível, lista das cinco últimas, estado sem ideias, esqueletos durante a carga, dashboard sem sessão indo para `/join` e menu com "Dashboard" em primeiro.
