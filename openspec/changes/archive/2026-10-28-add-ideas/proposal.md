# Proposal

## Why

O Tipo de Ideia já existe, mas ainda não há onde registrar as ideias em si. A Ideia é a matéria-prima de todo o ciclo do produto (capturar, processar com IA, refinar), então o cadastro do seu cabeçalho, vinculado a um Tipo de Ideia, é o próximo passo para o processamento poder existir.

## What Changes

- Novo agregado `idea` no módulo `ideas`, com `name`, `description`, `objective`, vínculo com um Tipo de Ideia e dono (`userId`).
- Regras de negócio para salvar (criar ou atualizar) e excluir uma Ideia, exigindo que o Tipo de Ideia exista e seja do mesmo usuário, e controlando a propriedade por usuário.
- Persistência da Ideia no banco (exclusão lógica) e API REST autenticada em `/ideas` (criar, atualizar, excluir, buscar por id e listar paginado).
- Telas privadas: listagem paginada em `/ideas` com o nome do Tipo de Ideia, formulário compartilhado de criação e edição com seleção do tipo, e exclusão com confirmação.
- Item "Ideias" no menu lateral, abaixo de "Tipos de Ideia".
- Mensagens de erro de Ideia em português e inglês.
- Fora de escopo: recursos de contexto, processamento por IA, resultado e dashboard.

## Capabilities

### New Capabilities
- `ideas`: cadastro de Ideias pelo backend, com validação, vínculo obrigatório com um Tipo de Ideia do próprio usuário, propriedade por usuário, listagem paginada e API autenticada.
- `ideas-screens`: telas de listagem, formulário de criação e edição e exclusão de Ideias no front-end.

### Modified Capabilities
- `frontend-shell`: a sidebar privada passa a ter também o item "Ideias".

## Impact

- `modules/ideas`: novo agregado `idea` (entidade, repositório, casos de uso e testes), reaproveitando o `IdeaTypeRepository`.
- `apps/backend`: model e migration de `ideas`, repositório Prisma, `idea.controller.ts`, `idea.integration.http`, relações inversas em `IdeaType` e `User` no schema.
- `apps/frontend`: rotas `/ideas`, `/ideas/new` e `/ideas/[id]/edit`, layout privado e i18n pt/en.
- Banco: nova tabela `ideas` com chaves estrangeiras para `idea_types` e `users`.
- Depende das changes `add-idea-types` e `add-default-idea-types`, já arquivadas.
- Origem do requisito: `.docs/007-cadastro-ideia/spec.md`.
