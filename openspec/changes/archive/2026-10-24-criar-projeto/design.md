# Design

## Context

Projeto greenfield; não há código além dos artefatos OpenSpec. O escopo vem de `.docs/001-criar-projeto/spec.md`, que já mapeia cada etapa a uma skill do repositório em `.claude/skills/`. Ver proposal.md para a motivação.

## Goals / Non-Goals

**Goals:**
- Reproduzir a base técnica de forma determinística, usando as skills do projeto.
- Entregar builds de backend, frontend e pacote compartilhado passando.

**Non-Goals:**
- Módulos de negócio, endpoints de login/cadastro, models de domínio.

## Decisions

- **Scaffolding por skills**: usar `config-project-fullstack`, `config-prisma`, `config-package-shared`, `backend-nest-config` e `frontend-next-config` em vez de escrever à mão; garante padrão único para skills posteriores. Alternativa: criar manualmente (descartada por divergir das convenções esperadas pelas demais skills).
- **Ordem**: monorepo → Prisma → pacote compartilhado → config do backend → frontend. O backend-nest-config depende do client Prisma gerado e do pacote compartilhado.
- **JWT guard global (`APP_GUARD`) com `@Public()`**: seguro por padrão; rotas abertas são opt-in. Filtro global de exceções via `APP_FILTER`.
- **Prisma modular**: um `.model.prisma` por domínio, com `bootstrap.model.prisma` inicial, facilitando a entrada de módulos futuros.

## Risks / Trade-offs

- [Build do backend falha sem client Prisma] → executar `prisma:generate` antes do build.
- [`frontend-next-config` pode pedir input interativo] → aplicar o fluxo de forma não interativa.
- [Incompatibilidade com `react-day-picker` v9 nos componentes copiados] → ajustar `calendar` e `date-picker-input` conforme necessário.
