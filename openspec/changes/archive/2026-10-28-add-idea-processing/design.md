# Design

## Context

O módulo `ideas` terá, ao fim das changes `add-ideas` e `add-idea-resources`, os agregados `idea-type` e `idea` (com recursos), `DeleteIdea` com exclusão lógica, e o controller e o menu correspondentes. A change `add-ai-text-generation` cria o módulo `ai` do backend com `AiProvider` abstrato e `OpenAiProvider`. Esta change depende das três e deve ser aplicada depois delas. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Processamento como agregado próprio, com snapshot imutável e histórico de iterações que só cresce.
- Composição do prompt no domínio, reutilizada pela criação e pelo refinamento, e IA acessada por uma abstração do módulo.

**Non-Goals:**
- Streaming, cache de gerações, edição do Processamento, exclusão de iteração isolada e busca semântica.
- Limite de tempo na chamada à IA.

## Decisions

- **Agregado `processing` com iteração interna.** `Processing` tem o snapshot e as coleções `resources` (estrutura simples, não entidade) e `iterations` (entidade interna `ProcessingIteration`, sem repositório nem controller). `Processing.validate()` exige ao menos 1 e no máximo 50 iterações e delega a validação a cada item.
- **Repositório do agregado.** `create` grava Processamento, iterações e snapshot de recursos em uma transação; `appendIteration` insere a nova iteração e atualiza `updatedAt` do Processamento na mesma transação, para a listagem refletir a atividade; `findById` carrega tudo ordenado por `position`; `findPage` filtra por `userId` e devolve a contagem de iterações sem carregá-las; `searchIdeas` faz a busca do combobox. `findById` não filtra por usuário e a propriedade é checada no caso de uso e no controller, como no resto do módulo.
- **Porta de IA no domínio.** O módulo define a interface `AiProvider` (`generate({ systemPrompt, userMessage })`) e o backend registra um adaptador que delega ao `AiProvider` do módulo `ai`, sob o token do módulo `ideas`. Os casos de uso não passam por `POST /ai/generate`.
- **Composição de prompt isolada.** Um compositor no domínio resolve o prompt do snapshot e monta a mensagem de refinamento, com teste próprio. A substituição dos marcadores é feita em uma única passada sobre os quatro marcadores conhecidos, para que um valor que contenha um marcador não seja reprocessado. Marcadores desconhecidos ficam literais.
- **Ordem na criação.** `StartProcessing` valida a Ideia e o tipo, monta o snapshot, chama a IA e só então persiste; assim uma falha da IA não deixa nada salvo. `RefineProcessing` valida o refinamento e o limite antes de chamar a IA e só persiste a iteração se a geração der certo.
- **Posição das iterações.** A nova iteração recebe `position` igual à quantidade atual. Dois refinamentos simultâneos poderiam gerar a mesma posição; o índice de `(processingId, position)` é **único**, de modo que o segundo falha em vez de corromper a ordem. O documento de origem prevê o índice sem unicidade.
- **404 para qualquer acesso indevido** a Processamento, nunca 403, inclusive em refinar e excluir.
- **Rotas fixas antes da rota por id.** `GET /processings/idea-search` é declarado antes de `GET /processings/:id` para não ser capturado como id.
- **Códigos de status.** Criar e refinar respondem 201; excluir responde 204, como pede o documento de origem (as exclusões já existentes respondem 200).
- **Trava de exclusão de Ideia.** Como a Ideia é excluída logicamente, a chave estrangeira com `Restrict` não bloquearia nada; `DeleteIdea` passa a consultar, por uma operação do repositório de Processamentos, se existe Processamento da Ideia e lança `DomainError('idea.has_processings', 409)`. A chave estrangeira permanece como defesa adicional.
- **Paginação** por `page` e `perPage`, como nos demais endpoints (o documento de origem cita `pageSize`).
- **Front-end.** Combobox de busca com pausa de 300 ms; criação com indicador de progresso; detalhe com timeline em Markdown (`react-markdown` e `remark-gfm`) sob as classes `prose` do Tailwind Typography; refinamento em `Textarea` puro. As dependências de Markdown e do plugin de tipografia são instaladas e o plugin é ativado no CSS global, se ainda não estiverem.
- **Menu.** O documento fala em seção "Cadastros" de um módulo; o menu real é plano (spec 004), então o item "Processamentos" entra abaixo de "Ideias".
- **Memória.** Os arquivos `.spec/memory/dominio.md`, `processamento-ia.md` e `roadmap.md` citados no documento de origem não existem; as atualizações vão para `openspec/memory/modulos.md`, `openspec/memory/modules/ideas.md` e `contexto-tecnico.md`.
- **Capabilities próprias.** As capabilities de Ideia e do menu completo ainda não existem como specs principais; a única modificação de spec existente é a do menu, escrita com a lista completa de itens.

## Risks / Trade-offs

- [Chamada à IA demora e o navegador ou um proxy pode cortar a requisição] → sem limite de tempo próprio nesta entrega; o front mostra progresso e o usuário pode repetir.
- [Prompt do tipo muito grande mais histórico de 50 iterações pode estourar o contexto do modelo] → o limite de 50 iterações ajuda; um erro do provedor vira `ai.generate.failed` e o usuário vê a falha.
- [Resultado da IA em Markdown renderizado no navegador] → o renderizador não executa HTML cru por padrão, o que evita injeção de script.
- [Excluir uma Ideia só depois de apagar seus Processamentos pode surpreender] → a mensagem do erro explica o motivo.
- [Aplicação antes das changes das quais depende] → aplicar depois de `add-ideas`, `add-idea-resources` e `add-ai-text-generation`.

## Open Questions

- Nenhuma que mude os requisitos; o ícone final do menu ("Workflow" ou "Sparkles") é escolhido na implementação.
