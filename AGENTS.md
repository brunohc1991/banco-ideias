<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Contexto do projeto (Banco de Ideias)

Antes de mexer no código, leia a memória do projeto em `openspec/memory/`:

- `produto.md`: o que o produto faz, conceitos do domínio e decisões de produto.
- `contexto-tecnico.md`: stack, convenções fixas, autenticação, erros e integração com IA.
- `estrutura.md`: onde fica cada coisa (monorepo, módulos, backend e front-end).
- `modulos.md` e `modules/*.md`: regras de negócio de cada módulo (`auth` e `ideas`).

O comportamento atual de cada funcionalidade está nas specs em `openspec/specs/`; mudanças
novas seguem o fluxo OpenSpec em `openspec/changes/`. Ao entregar algo que altere um fato
registrado na memória, atualize o arquivo correspondente. Para rodar os testes use `npm test`
na raiz.
