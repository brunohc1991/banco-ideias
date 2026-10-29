# Proposal

## Why

Capturar uma ideia só tem valor se ela puder virar conteúdo pronto. O Processamento é o passo que faz isso: combina a Ideia, seus Recursos e o prompt do Tipo de Ideia para a IA gerar um resultado, que a pessoa refina quantas vezes precisar sem perder as versões anteriores. É o núcleo da proposta do produto ("capture ideias, processe com IA, reaproveite quantas vezes precisar").

## What Changes

- Novo agregado **Processamento** no módulo `ideas`, separado da Ideia, que guarda uma cópia congelada (snapshot) da Ideia, do nome do tipo, do prompt do tipo e dos recursos, para que editar a Ideia depois não altere resultados antigos.
- Criar um Processamento gera o primeiro resultado com a IA; **refinar** acrescenta novas iterações ao histórico, sem substituir as anteriores. A mesma Ideia pode ter vários Processamentos independentes.
- Composição do prompt no backend em duas fases: a primeira geração usa o prompt do tipo com os marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}` substituídos; os refinamentos enviam também o histórico das iterações e o novo pedido.
- Limites e regras: até 50 iterações por Processamento, refinamento de 3 a 2000 caracteres, acesso restrito ao dono (404 para Processamento de outro usuário) e exclusão do Processamento inteiro (as iterações vão junto).
- API autenticada em `/processings`: criar, refinar, excluir, consultar, listar paginado e buscar Ideias para o combobox.
- **BREAKING**: excluir uma Ideia que tenha Processamentos passa a responder 409 `idea.has_processings`.
- Telas privadas: listagem `/processings`, criação `/processings/new` com busca de Ideia, e detalhe `/processings/[id]` com linha do tempo das iterações em Markdown e rodapé de refinamento.
- Item "Processamentos" no menu lateral, abaixo de "Ideias".
- Mensagens de erro em português e inglês.
- Fora de escopo: streaming, cache, exclusão de iteração isolada, busca semântica, edição do Processamento e múltiplos formatos de saída.

## Capabilities

### New Capabilities
- `idea-processing`: criação, refinamento, exclusão, consulta, listagem e busca de Ideia para Processamentos com snapshot, histórico de iterações e prompt composto no backend, mais a trava de exclusão de Ideia com Processamentos.
- `idea-processing-screens`: telas de listagem, criação e detalhe de Processamentos, com busca de Ideia, linha do tempo em Markdown e refinamento.

### Modified Capabilities
- `frontend-shell`: a sidebar privada passa a ter também o item "Processamentos".

## Impact

- `modules/ideas`: novo agregado `processing` (entidade, iteração interna, composição de prompt, repositório e fake, casos de uso, porta de IA) e ajuste em `DeleteIdea`.
- `apps/backend`: models e migration `processings`, repositório Prisma, adaptador da IA, `processing.controller.ts` e `processing.integration.http`.
- `apps/frontend`: tipos, API, três telas, componente de busca de Ideia, renderização Markdown com Tailwind Typography, menu e i18n.
- Banco: tabelas `processings`, `processing_iterations` e `processing_resources`.
- Depende das changes `add-ideas`, `add-idea-resources` e `add-ai-text-generation` (ainda não aplicadas): usa a Ideia e seus recursos, e o provedor de IA do módulo `ai`.
- Origem do requisito: `.docs/011-processamento-da-ideia/spec.md`.
