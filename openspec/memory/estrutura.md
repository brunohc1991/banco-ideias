# Estrutura do Projeto

Monorepo Turborepo (npm workspaces) com três grupos: `apps/*` (executáveis), `modules/*`
(módulos de negócio puros) e `packages/*` (compartilhados e configuração).

## Raiz

```
package.json     # workspaces; scripts build, dev, lint, test, check-types, format (via turbo)
turbo.json       # tarefas build, test, lint, check-types, dev
openspec/        # specs, changes e memória do projeto (ver abaixo)
.docs/           # documentos de origem dos requisitos (001 a 012), um por feature
.claude/         # skills do projeto (geradoras e do fluxo OpenSpec) e comandos opsx
AGENTS.md        # instruções para agentes (bloco gerenciado pelo turbo)
apps/  modules/  packages/
```

`npm test` na raiz roda os testes de todos os pacotes (`turbo run test`, que builda as
dependências antes). A tarefa `build` guarda `.next/**` como saída, exceto `cache` e `dev`.

## `openspec/`

```
openspec/
  config.yaml   # schema spec-driven
  specs/        # specs principais, uma pasta por capability (spec.md)
  changes/      # changes ativas; archive/ guarda as concluídas (prefixo AAAA-MM-DD-)
  memory/       # ESTE diretório: memória viva (produto, contexto técnico, estrutura, módulos)
  shared/       # como-executar.md, regras-de-nomenclatura.md
  templates/    # modelo-base.md, modelo-crud.md
```

Os requisitos nascem em `.docs/NNN-*/spec.md`, viram uma change (proposal, design, specs
delta, tasks) e, ao arquivar, sincronizam as specs principais. Changes arquivadas, em
ordem: criar-projeto, registrar-usuario, add-user-login, personalize-application,
add-idea-types, add-default-idea-types, add-ideas, add-ai-text-generation,
add-idea-resources, add-ai-voice-transcription, add-idea-processing, add-dashboard-overview.

## `packages/`

- **`packages/shared`** (`@ideias/shared`): base do domínio, publicada em `dist/`.
  - `model/entity.ts`: `Entity<TState>` (id uuid, `createdAt`, `updatedAt`, `deletedAt`,
    `validate()` abstrato, `clone()`, `equals()`).
  - `usecase/use-case.ts`: `interface UseCase<IN, OUT>`.
  - `db/`: contratos de repositório (`CrudRepository` e os granulares `create`, `update`,
    `delete`, `find-by-id`, `find-page`) e `PageResult`.
  - `error/`: `DomainError`, `ValidationError`, `ValidationException`, `NotFoundError`,
    `ConflictError`, `UnauthorizedError`.
  - `validation/`: `Validator`, interfaces de regra e `rules/` (cerca de 60 regras, como
    required, uuid, min/max-length, integer, min-value, in, email, cpf, strong-password).
- **`packages/eslint-config`**, **`packages/typescript-config`**: configurações
  compartilhadas.
- **`packages/ui`**: scaffold do template do Turborepo (button, card, code); o app não o usa.

## `modules/` (negócio puro, sem NestJS, Prisma nem HTTP)

Cada módulo é organizado por **agregado**, com `model/`, `provider/` (interfaces),
`usecase/` e, quando preciso, `constant/` ou `util/`; `index.ts` em cada nível. Os testes
ficam em `modules/<m>/test/`, espelhando `src/`, e os fakes em `test/mock/`.

- **`modules/auth`** (`@ideias/auth`): agregado `user` (`user.entity`, `user.repository`,
  `crypto.provider`; casos `register-user`, `login-user`, `create-user`).
- **`modules/ideas`** (`@ideias/ideas`): quatro agregados.
  - `idea-type/`: `idea-type.entity`, `idea-type.repository`; casos `save`, `delete`,
    `load-default-idea-types`; `constant/default-idea-types.constant`.
  - `idea/`: `idea.entity`, `resource.entity` (entidade interna), `idea.repository`;
    casos `save-idea` e `delete-idea`.
  - `processing/`: `processing.entity`, `processing-iteration.entity`,
    `processing.repository`, `ai.provider` (porta de IA do módulo),
    `util/prompt-composer.util`; casos `start`, `refine` e `delete-processing`.
  - `dashboard/`: somente leitura; `model/dashboard.types` e `load-dashboard-summary.usecase`.

## `apps/backend` (NestJS, adaptadores)

```
src/
  main.ts  app.module.ts  app.controller.ts  app.service.ts
  db/                # DbModule + PrismaService (adapter pg)
  shared/
    auth/            # jwt.strategy, jwt-auth.guard, jwt-auth.module, auth-user.mapper
    decorators/      # @Public(), @CurrentUser()
    errors/          # ApiExceptionFilter, error-response.type
    types/           # jwt-payload, current-user, authenticated-request
  modules/
    auth/            # auth.controller, user.prisma, bcrypt.crypto, jwt.util, auth.module
    ideas/           # controllers (idea-type, idea, processing, dashboard) e *.prisma,
                     #   module-ai-provider.adapter, ideas.tokens, daily-window.util,
                     #   ideas.module
    ai/              # ai.controller, anthropic.provider, openai.provider, ai.provider,
                     #   audio-upload-error.interceptor, ai.module (infra, sem agregado)
prisma/
  schema.prisma          # generator + datasource
  models/*.model.prisma  # auth e ideas (um arquivo por módulo)
  migrations/            # auth, idea_types, ideas, resources, processings
  seed/main.ts
test/app.e2e-spec.ts
```

Cada módulo traz seu `*.integration.http` (REST Client) ao lado dos controllers. Testes
unitários do backend são `*.spec.ts` ao lado do código. O `AppModule` registra
`JwtAuthGuard` como `APP_GUARD` e `ApiExceptionFilter` como `APP_FILTER`, ambos globais;
`ConfigModule` é global. `docker-compose.yml` sobe o Postgres.

## `apps/frontend` (Next.js, App Router)

```
src/
  app/
    layout.tsx  page.tsx  globals.css
    (public)/    # layout + join/ (cadastro e login)
    (private)/   # layout (AuthGuard, AdminShell, SidebarMenu) e rotas:
                 #   dashboard/, idea-types/[new|[id]/edit], ideas/[new|[id]/edit],
                 #   processings/[new|[id]]
  shared/
    api/                 # ai.api.ts (geração e transcrição)
    components/ui/       # design system (46 componentes: button, table, dialog,
                         #   ai-text-field, metric-card, composed-bar-line-chart, ...)
    components/form/     # validator client-side
    components/branding/ # app-logo
    template/            # admin-shell, app-shell, public-boxed-layout
    context/  hooks/  i18n/  lib/  util/  types/
  modules/
    auth/        # context (AuthContext), guard (AuthGuard), pages, components, util/jwt
    ideas/       # components, pages, service (idea, idea-type, processing), util
    dashboard/   # components (principal, stats, quick-access, chart, latest-ideas),
                 #   pages, service/dashboard.api
```

Cada módulo segue `pages/` (fina, usada pela rota), `components/` (lógica e UI) e
`service/` (wrappers de `fetch` por recurso). As rotas em `app/` só importam a página do
módulo. O menu lateral da área privada fica em `(private)/layout.tsx`, em ordem fixa:
**Dashboard, Tipos de Ideia, Ideias, Processamentos**. Identidade visual: nome "Banco de
Ideias", ícone `BrainCircuit` (lucide-react), paleta escura zinc com âmbar.
