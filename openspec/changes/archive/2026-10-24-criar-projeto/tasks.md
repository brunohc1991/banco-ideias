# Tasks

## 1. Monorepo

- [x] 1.1 Criar o monorepo com a skill `config-project-fullstack` e namespace `@ideias`; verificar que `apps/frontend` e `apps/backend` existem, com `.env` e `.env.example`, e que os workspaces usam o escopo `@ideias`.

## 2. Persistência

- [x] 2.1 Configurar o Prisma com a skill `config-prisma`; verificar a presença de `prisma/schema.prisma`, `prisma/models/bootstrap.model.prisma`, `prisma/seed/main.ts`, `prisma.config.ts`, `docker-compose.yml`, `DbModule` e `PrismaService`.
- [x] 2.2 Rodar `npm --workspace apps/backend run prisma:generate` e verificar que o client é gerado sem erros.

## 3. Pacote compartilhado

- [x] 3.1 Reconstruir o pacote com a skill `config-package-shared`; verificar que `turbo run build --filter=@ideias/shared` passa.

## 4. Backend

- [x] 4.1 Aplicar a skill `backend-nest-config`; verificar a existência de `apps/backend/src/shared/` com filtro de exceções e guard JWT registrados no `AppModule`, e `JWT_SECRET`/`JWT_EXPIRES_IN` nos arquivos `.env`.
- [x] 4.2 Verificar que `npm --workspace apps/backend run build` passa, que `GET /` responde sem token e que uma rota inexistente retorna o erro padronizado.

## 5. Frontend

- [x] 5.1 Aplicar a skill `frontend-next-config`; verificar `src/shared/`, layouts `(public)` e `(private)` e a sidebar em `shared/navigation/`.
- [x] 5.2 Verificar que `npm run build` em `apps/frontend` passa e que as rotas `/`, `/join` e `/example/dashboard` são geradas.

## 6. Integração

- [x] 6.1 Subir backend (4000) e frontend (3000) e verificar que ambos iniciam sem erros e a sidebar navega entre rotas privadas.
