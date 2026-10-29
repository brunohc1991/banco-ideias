# Design

## Context

O módulo `ideas` já tem o agregado `idea-type` (entidade, repositório com `findById` sem filtro de usuário e `findPage({ userId, page, perPage })`, casos de uso de salvar e excluir), o controller `/idea-types` autenticado, o front-end com listagem e formulário compartilhado e o menu plano com Dashboard e Tipos de Ideia. A política do projeto é: `findById` não filtra por usuário; leitura de registro alheio responde 404 e mutação responde 403. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Repetir o padrão do `idea-type` no segundo agregado, adicionando a verificação cruzada do Tipo de Ideia.
- Isolar os dados por usuário em todas as operações.

**Non-Goals:**
- Recursos de contexto, processamento, resultado e IA.
- Bloquear a exclusão de um Tipo de Ideia que tenha Ideias.
- Rótulo do tipo vindo do backend (join) ou seleção de tipos com busca.

## Decisions

- **Agregado e casos de uso pelas skills do projeto** (`module-aggregate`, `module-entity`, `module-repository`, `module-use-case`, `backend-prisma-*`, `backend-nest-controller`), como no `idea-type`.
- **`SaveIdea` recebe `IdeaRepository` e `IdeaTypeRepository`.** Valida a entidade, consulta `ideaTypeRepository.findById`; tipo inexistente ou de outro usuário lança `DomainError('idea.ideaType.invalid', 422)`. Depois decide criar ou atualizar por `ideaRepository.findById`: registro do mesmo usuário atualiza, inexistente cria e de outro usuário lança `DomainError('idea.forbidden', 403)`.
- **Conflito no documento de origem sobre registro de outro usuário.** O passo 3 diz que ele "cria" e o passo 4 diz que lança 403. Adotou-se o 403, igual ao `idea-type` e à política do projeto.
- **`findById` sem `userId`**, apesar de o documento dizer que as consultas aceitam `userId`: a política do projeto exige distinguir "não existe" de "é de outro" para responder 403 em mutações. Só `findPage` filtra por `userId`; leituras por id comparam o dono no controller e respondem 404.
- **Resposta sem `userId`**: `{ id, name, description, objective, ideaTypeId, updatedAt }`, com `updatedAt` em ISO 8601.
- **Paginação por `page` e `perPage`**, como em `/idea-types`. O documento de origem cita `pageSize`; adotou-se `perPage` para ter um único nome na API.
- **Nome do tipo resolvido no front-end.** A listagem e o formulário usam uma lista de Tipos de Ideia obtida de `GET /idea-types` (com tamanho de página grande) para mostrar o nome a partir do `ideaTypeId`. Alternativa descartada: o backend devolver `ideaTypeName`, que exigiria join no repositório ou N consultas.
- **Exclusão lógica** (`deletedAt`) no Prisma; chaves estrangeiras para `idea_types` e `users` com `onDelete: Restrict`, e relações inversas `ideas` em `IdeaType` e `User`.
- **Códigos de erro em camelCase para campos** (`idea.ideaTypeId.uuid`), como o `Validator` gera, e `idea.not_found`/`idea.forbidden` como no `idea-type`.

## Risks / Trade-offs

- [Tipo de Ideia excluído (lógico) continua referenciado por Ideias existentes] → a listagem mostra um rótulo neutro no lugar do nome e salvar com esse tipo falha com `idea.ideaType.invalid`; bloquear a exclusão do tipo fica para uma spec futura.
- [Usuário com mais Tipos de Ideia que o tamanho de página usado no front-end] → o seletor e o rótulo mostram só os primeiros; aceito no MVP, registrado como limitação.
- [`PUT` em id de Ideia já excluída tenta recriar com a mesma chave primária] → mesmo comportamento já conhecido no `idea-type`; tratar nos dois agregados em uma spec de manutenção.
- [Migration em banco compartilhado] → migration incremental nomeada (`ideas`).
