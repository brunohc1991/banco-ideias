# Proposal

## Why

O projeto Banco de Ideias ainda não possui código. Antes de qualquer módulo de negócio (ex.: cadastro de usuário), é preciso uma base técnica comum: monorepo, backend, frontend, persistência, pacote compartilhado e autenticação/erros padronizados.

## What Changes

- Criar o monorepo Turbo com namespace `@ideias`, contendo `apps/frontend` (Next.js, porta 3000) e `apps/backend` (NestJS, porta 4000), com variáveis de ambiente e CORS.
- Configurar a infraestrutura de persistência com Prisma (schema modular por domínio, seed técnico, Docker Compose de banco, `DbModule`/`PrismaService`).
- Criar o pacote compartilhado `@ideias/shared` consumível por backend, frontend e módulos futuros.
- Configurar no backend o tratamento centralizado de erros e a base de autenticação JWT (guard global com rotas públicas explícitas).
- Configurar no frontend a pasta `shared/` e os grupos de rotas `(public)` e `(private)` com sidebar de navegação.
- Fora de escopo: qualquer módulo de domínio (`auth`, usuários etc.), que serão criados em changes posteriores.

## Capabilities

### New Capabilities
- `monorepo-workspace`: estrutura do monorepo, apps, portas, namespace e configuração de ambiente.
- `database-persistence`: infraestrutura de banco com Prisma modular, seed técnico e ambiente local via Docker.
- `shared-package`: pacote compartilhado reutilizável entre apps e módulos.
- `backend-api-foundation`: tratamento centralizado de erros e autenticação JWT padrão da API.
- `frontend-shell`: estrutura compartilhada do frontend e rotas públicas/privadas com sidebar.

### Modified Capabilities

## Impact

- Novo código em `apps/frontend`, `apps/backend`, `packages/shared`, `apps/backend/prisma` e configuração raiz (Turbo, workspaces).
- Novas dependências: Turbo, Next.js, NestJS, `@nestjs/config`, Prisma, JWT, bibliotecas de UI (Radix, lucide-react, recharts etc.).
- Novas variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
- Fonte do escopo: `.docs/001-criar-projeto/spec.md`.
