# Contexto Técnico Global

Stack, restrições e decisões transversais que valem para todo o projeto. Specs individuais
referenciam este arquivo em vez de repetir o conteúdo.

## Monorepo

- **Turborepo** (`turbo` 2.x), gerenciado por **npm workspaces** (`npm@10.9.2`,
  Node >= 24). Namespace npm do workspace: **`@ideias`**.
- Workspaces: `apps/*`, `modules/*`, `packages/*`.
- Scripts na raiz: `npm run build|dev|lint|test|check-types` (delegam ao `turbo`) e
  `npm run format` (prettier em `**/*.{ts,tsx,md}`). `npm test` builda as dependências
  (`dependsOn: ["^build"]`) e roda os testes de `shared`, `auth`, `ideas` e `backend`; o
  front-end não tem testes.
- Linguagem 100% **TypeScript**. A raiz usa TS 7.x; `apps/backend`, `modules/*` e
  `packages/shared` fixam TS 5.9, usado pelo Nest CLI e pelo ts-jest. Por isso os
  `tsconfig.json` não podem usar opções exclusivas do TS 7 (como `ignoreDeprecations: "6.0"`,
  que quebra o build do backend). Prettier e ESLint configurados; o ESLint do front-end não
  roda com TS 7.

## Aplicações

- **`apps/backend`**: NestJS 11, porta **4000** (`PORT`). CORS habilitado, `@nestjs/config`
  global. Build com `nest build`. Testes com Jest + ts-jest (`*.spec.ts`, rootDir `src`).
  Em desenvolvimento use `npm run start:dev` (watch). Se o watch ficar com código velho
  (por exemplo após `prisma generate` ou rebuild de um módulo), reinicie-o.
- **`apps/frontend`**: Next.js 16 (App Router, React 19), porta **3000**, API em
  `NEXT_PUBLIC_API_URL`. Tailwind CSS v4 + `@tailwindcss/typography` (plugin ativado em
  `globals.css`). UI sobre Radix UI, `lucide-react` e `class-variance-authority`. Gráficos
  com `recharts`. Markdown com `react-markdown` + `remark-gfm`. Toaster `sonner`. Sessão em
  cookie via `js-cookie`. `react-hook-form` só no validador client-side
  (`shared/components/form/validator`). Em dev, `next dev` escreve em `.next/dev` e pode
  coexistir com `next build`.

## Persistência

- **PostgreSQL** via **Prisma 7** (`@prisma/client`, `@prisma/adapter-pg`, `pg`).
- Schema **modular por domínio**: `apps/backend/prisma/schema.prisma` é só o root
  (generator + datasource); os models ficam em
  `apps/backend/prisma/models/<modulo>.model.prisma` (`auth.model.prisma`,
  `ideas.model.prisma`).
- Migrations incrementais nomeadas por módulo em `apps/backend/prisma/migrations/`
  (`auth`, `idea_types`, `ideas`, `resources`, `processings`). Depois de mudar o schema,
  rode `prisma migrate dev` e `prisma generate`.
- Seed técnico em `apps/backend/prisma/seed/main.ts` (sem seeds de módulo).
- `DATABASE_URL` no `.env` do backend; Postgres sobe via `docker compose`
  (`npm run db:start` no backend).
- **Exclusão lógica** (`deletedAt`) em usuários, Tipos de Ideia e Ideias; Processamentos e
  Recursos são excluídos fisicamente (e, no caso dos filhos, em cascata). Contagens e
  buscas ignoram os excluídos logicamente. Datas agrupadas por dia usam UTC.

## Arquitetura (clean architecture / portas e adaptadores)

- **Módulos de negócio** vivem em `modules/*` (pacotes npm puros, sem NestJS, sem Prisma,
  sem HTTP). Contêm `model/` (entidades), `provider/` (interfaces de repositório e portas),
  `usecase/` (casos de uso), `constant/` e `util/` quando preciso. Organizados por
  **agregado**. Os fakes dos repositórios ficam em `test/mock/`, não em `src/`.
- **Pacote compartilhado** `packages/shared` (`@ideias/shared`) concentra: `Entity` base,
  contrato `UseCase<IN,OUT>`, interfaces de repositório (`CrudRepository` e granulares),
  `DomainError` e uma biblioteca de regras de validação (`Validator` + cerca de 60
  `*.rule.ts`). Os pacotes são consumidos pelo `dist/`, então mudar `shared` ou um módulo
  exige rebuild (o `turbo` faz isso por `^build`).
- **Backend** apenas adapta: controllers finos em `apps/backend/src/modules/<modulo>`,
  implementações Prisma dos repositórios (`*.prisma.ts`) e providers técnicos, registrados
  no módulo Nest correspondente. Infra pura (IA) é módulo Nest sem agregado em `modules/`
  (`apps/backend/src/modules/ai`).

## Convenções fixas

- **Linguagem do código em inglês** (identificadores: `IdeaType`, `SaveIdea`,
  `StartProcessing`, `ideaTypeId`); **conceitos do domínio em português** apenas em telas,
  mensagens e documentação ("Tipo de Ideia", "Processamentos", "Reprocessar").
- **Nomenclatura**: arquivos/diretórios em `kebab-case`, sufixos por responsabilidade
  (`*.entity.ts`, `*.usecase.ts`, `*.repository.ts`, `*.controller.ts`, `*.page.tsx`,
  `*.component.tsx`, `*.util.ts`, etc.). Detalhe em
  [Regras de nomenclatura](../shared/regras-de-nomenclatura.md).
- **Sem DTOs de entrada** no backend: o controller recebe o `Body` cru e monta o input do
  caso de uso. **Respostas de leitura são mapeadas explicitamente** para objetos simples no
  controller: entidades usam `protected readonly props` com getters de prototype, que
  serializam como `{}` via `JSON.stringify`.
- **Casos de uso de comando** devolvem `void`, salvo quando o cliente precisa do resultado
  (`StartProcessing` devolve o `Processing`; `RefineProcessing`, a iteração criada).
  Consultas simples (`findById`, `findPage`) **não** viram caso de uso: o controller chama o
  repositório direto. Uma leitura que combina várias fontes vira caso de uso
  (`LoadDashboardSummary`).
- Caso de uso instanciado **no corpo do método** do controller, recebendo
  repositórios/providers injetados no construtor do controller.
- **Validação de negócio dentro da entidade** (`validate()` com `Validator.validate`); uma
  entidade que agrega filhos valida a coleção e delega a cada item (`Idea` com `Resource`,
  `Processing` com `ProcessingIteration`). Validação de entrada que não é de entidade usa
  `Validator.validate` direto no caso de uso. Client-side só `required` nos inputs.
- **Códigos de erro** no formato `<agregado>.<campo>.<regra>` (`idea.name.min.length`),
  `<agregado>.not_found` e `<agregado>.forbidden`. Cada código tem mensagem pt e en no
  front-end.
- **Propriedade por usuário**: todo agregado grava `userId` (extraído do JWT) e filtra por
  ele. `findById(id)` não recebe `userId`; a checagem de propriedade é feita no caso de
  uso/controller. Em Ideias e Tipos, 403 em mutações cross-user e 404 em leituras por id; em
  Processamentos, 404 para qualquer acesso indevido (não vazar existência alheia).

## Autenticação

- JWT no backend (`@nestjs/jwt` + `passport-jwt`, libs `jsonwebtoken`/`bcrypt`).
  `JwtAuthGuard` é **guard global** (`APP_GUARD`); endpoints públicos marcados com
  `@Public()`. Senha com `bcrypt`.
- **O módulo de negócio `auth` não conhece JWT/token/sessão**. O caso de uso `login-user`
  só devolve `{ id, name, email }`; o JWT é gerado **no `auth.controller.ts`** a partir
  dessa saída. Segredo em `JWT_SECRET`; expiração em `JWT_EXPIRES_IN` (`7d` no
  `.env.example`; sem a variável, o módulo JWT assume `1d`).
- Frontend mantém sessão em cookie `auth_token` (`sameSite: lax`, `secure` em prod,
  sem `httpOnly`: o client lê para reidratar o `AuthContext`). Decodificação do payload
  com `TextDecoder('utf-8')` (preserva acentuação). Rotas privadas protegidas por
  `AuthGuard` envolvendo o grupo `(private)`; sem sessão, redireciona para `/join`.

## Tratamento de erros

- `DomainError(message, statusCode)` no domínio (`message` = chave i18n, ex.:
  `idea-type.forbidden`). Erros de validação viram `ValidationException` com uma lista de
  `ValidationError` (422). `ApiExceptionFilter` global (`APP_FILTER`) converte tudo em
  resposta padronizada `ApiErrorResponse` (`errors: string[]` com chaves i18n).
- Frontend traduz via `getMessage(key)` (`shared/i18n/`, pt/en por idioma do navegador) e
  dispara um `toast` por item. Um 401 encerra a sessão.

## Integração com IA

- Variáveis no `.env` do backend: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (padrão
  `claude-haiku-5-5`), `OPENAI_API_KEY` e `OPENAI_TRANSCRIPTION_MODEL` (padrão
  `whisper-1`). **Nunca** commitar chaves reais. Sem chave, o backend sobe e a chamada
  falha depois como `ai.generate.failed` ou `ai.transcribe.failed` (502).
- Provedor de **texto**: **Anthropic (Claude)** via `@anthropic-ai/sdk`
  (`AnthropicProvider`). Provedor de **voz** (transcrição): **OpenAI**, porque a Anthropic
  não transcreve áudio (`OpenAiProvider`, sobre um `AiTranscriptionProvider` próprio). Cada
  um tem cliente e chave próprios.
- Implementação concreta em `apps/backend/src/modules/ai` (módulo Nest de infraestrutura).
  O módulo `ai` expõe a abstração `AiProvider` (texto) e `AiTranscriptionProvider` (voz).
- Endpoints genéricos autenticados: `POST /ai/generate` (texto) e `POST /ai/transcribe`
  (voz, multipart, até 25 MB, só `audio/*`; o erro de tamanho do upload vira
  `ai.audio.too_large` 422 por um interceptador). Geração síncrona, sem streaming, sem
  cache. Erros do SDK viram `DomainError("ai.generate.failed", 502)` (mensagem do provedor
  só em log).
- `POST /ai/generate` é usado só como auxílio de preenchimento de formulários: a composição
  do prompt (orientação do campo, contexto e instrução) acontece no **front-end**. O
  resultado da geração **substitui** o valor do campo; o da transcrição é **sempre
  anexado** ao conteúdo (com um único espaço).
- O agregado `processing` (módulo `ideas`) monta o prompt no **backend** e depende da porta
  `AiProvider` do próprio módulo (`generate({ systemPrompt, userMessage })`), sem passar por
  `POST /ai/generate`. O backend a liga ao `AiProvider` do módulo `ai` pelo
  `ModuleAiProviderAdapter`, registrado sob o token `PROCESSING_AI_PROVIDER`. A composição
  do prompt (snapshot + histórico) fica no domínio (`prompt-composer.util`).
- Como a Ideia é excluída logicamente, a trava de exclusão não vem da chave estrangeira:
  `DeleteIdea` consulta `ProcessingRepository.existsByIdeaId` e lança `idea.has_processings`
  (409). O índice `(processingId, position)` das iterações é único para barrar refinamentos
  simultâneos.

## Validação automatizada

Os testes automatizados cobrem **domínio + backend**: testes unitários dos módulos e do
`shared` (Jest, com cobertura), testes `*.spec.ts` do backend e cenários HTTP em arquivos
`*.integration.http` (formato Rest Client) ao lado de cada controller. Rode tudo com
`npm test` na raiz. **Não há verificação automatizada de UI**: a interface é validada
manualmente no navegador.
