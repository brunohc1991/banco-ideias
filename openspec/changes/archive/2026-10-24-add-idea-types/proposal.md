# Proposal

## Why

O núcleo do produto é transformar ideias em conteúdo com IA, e isso depende de um **Tipo de Ideia**: a categoria reutilizável que carrega o prompt especializado. Sem o cadastro de tipos não há como criar ideias nem processá-las. Este é também o primeiro cadastro do módulo de negócio `ideas`, que ainda não existe.

## What Changes

- Novo módulo de negócio `ideas` (domínio, backend e estrutura de front-end) e agregado `idea-type` com `name`, `description`, `prompt` e dono (`userId`).
- Regras de negócio para salvar (criar ou atualizar) e excluir um Tipo de Ideia, com validação dos campos e controle de propriedade por usuário.
- Persistência do Tipo de Ideia no banco (exclusão lógica) e API REST autenticada em `/idea-types` (criar, atualizar, excluir, buscar por id e listar paginado).
- Telas privadas: listagem paginada em `/idea-types`, formulário compartilhado de criação e edição, e exclusão com confirmação.
- Item "Tipos de Ideia" no menu lateral.
- Mensagens de erro de Tipo de Ideia em português e inglês.
- Fora de escopo: carga de tipos padrão (spec futura), validação de marcadores no prompt, substituição de marcadores, chamada à IA e Ideias.

## Capabilities

### New Capabilities
- `idea-types`: cadastro de Tipos de Ideia pelo backend, com validação, propriedade por usuário, listagem paginada e API autenticada.
- `idea-types-screens`: telas de listagem, formulário de criação e edição e exclusão de Tipos de Ideia no front-end.

### Modified Capabilities
- `frontend-shell`: a sidebar privada passa a ter também o item "Tipos de Ideia" além do Dashboard.

## Impact

- Novo workspace `modules/ideas` e registro no backend e no front-end (scaffold da skill `config-new-module`).
- `apps/backend`: controller e repositório Prisma de `idea-type`, model e migration, `idea-type.integration.http`.
- `apps/frontend`: rotas `/idea-types`, `/idea-types/new`, `/idea-types/[id]/edit`, layout privado e i18n pt/en.
- Banco: nova tabela `idea_types`.
- Origem do requisito: `.docs/005-cadastro-tipo-de-ideia/spec.md`.
