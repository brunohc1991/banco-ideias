# Design

## Context

O monorepo já tem o módulo `auth` (entidade, repositório, casos de uso com fakes e testes), backend NestJS com guard JWT global, `CurrentUser`, filtro de erros que converte `DomainError` em `ApiErrorResponse`, e um front-end com menu lateral plano e shell privado protegido por `AuthGuard`. `PageResult` usa `page`, `perPage` e `total`. Ainda não existe o módulo `ideas`. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Criar o módulo `ideas` e o primeiro agregado seguindo o padrão do `auth`.
- Isolar os dados por usuário em todas as operações.

**Non-Goals:**
- Carga de tipos padrão, Ideias, processamento, IA e validação ou substituição de marcadores.
- DTOs de entrada.

## Decisions

- **Módulo e agregado pelas skills do projeto** (`config-new-module`, `module-aggregate`, `module-entity`, `module-repository`, `module-use-case`, `backend-prisma-*`, `backend-nest-controller`), para reaproveitar o padrão do `auth`.
- **Um caso de uso de comando para salvar** (`SaveIdeaType`, cria ou atualiza) e outro para excluir (`DeleteIdeaType`); ambos retornam `void`. Consultas por id e listagem não viram caso de uso: o controller chama o repositório direto.
- **Propriedade no domínio e no controller:** `findById` não filtra por usuário. Mutações comparam `userId` e respondem 403 (`idea-type.forbidden`); leituras por id respondem 404, para não revelar registros de outros. `findPage` filtra por `userId`.
- **Resposta mapeada no controller** para `{ id, name, description, prompt, updatedAt }`, porque entidades usam getters de prototype e não serializam em JSON.
- **Exclusão lógica** (`deletedAt`) no Prisma; buscas e listagens ignoram registros excluídos.
- **Paginação por `page` e `perPage`** na query, alinhada a `PageResult` e ao repositório. O documento de origem cita `pageSize` no front-end; adotou-se `perPage` para ter um único nome em todas as camadas.
- **Códigos de erro** como no documento de origem (`idea-type.not_found`, `idea-type.forbidden`), embora o restante do projeto use pontos em vez de sublinhado.
- **Salvar com id desconhecido:** segue o fluxo descrito (se o registro existe e é do mesmo usuário atualiza; se não existe, cria; se é de outro usuário, 403).
- **Rotas de front-end em `/idea-types`**, no grupo `(private)`. O scaffold de `config-new-module` cria uma página `(private)/ideas`; ela é ajustada para o módulo (ou removida) para não deixar rota órfã.

## Risks / Trade-offs

- [Salvar com id de outro usuário ou desconhecido cria ou revela comportamento inesperado] → o caso de uso responde 403 em id alheio; testes cobrem os dois cenários.
- [Código de erro com sublinhado destoa do padrão do projeto] → mantido por fidelidade ao documento; padronizar vira ajuste futuro.
- [Sem teste automatizado de UI] → validação manual das telas, mais `tsc` e build.
- [Migration em banco compartilhado] → migration incremental e nomeada (`idea-types`).
