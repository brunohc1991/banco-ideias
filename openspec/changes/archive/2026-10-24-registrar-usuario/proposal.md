# Proposal

## Why

O produto ainda não permite criar contas, e todo dado de negócio (Ideias, Tipos, Processamentos) pertence a um usuário. O cadastro é o primeiro passo do módulo de Autenticação e pré-requisito para o login e para o restante do produto.

## What Changes

- Novo módulo de negócio `auth` com o agregado `user` (entidade validada, repositório, provider de criptografia e caso de uso `register-user`).
- Novo endpoint público `POST /auth/register`, que cria a conta com a senha armazenada criptografada (bcrypt).
- Model `user` no Prisma, com migration.
- Tela `/join` passa a alternar entre cadastro (integrado ao backend) e login (apenas estrutura visual).
- Erros do registro exibidos como toasters individuais, com mensagens i18n em português e inglês.
- Nova dependência: `bcrypt` no backend.

## Capabilities

### New Capabilities
- `user-registration`: cadastro de usuário via API, com validação dos dados, unicidade de e-mail e senha armazenada de forma irreversível.
- `join-page`: tela `/join` com alternância cadastro/login, feedback por toasters e mensagens traduzidas.

### Modified Capabilities

Nenhuma.

## Impact

- Backend: `apps/backend/src/modules/auth`, `apps/backend/prisma/models/auth.model.prisma`, `package.json` (bcrypt), `AppModule`.
- Módulo de negócio: `modules/auth`.
- Frontend: `apps/frontend/src/app/(public)/join/`, `apps/frontend/src/shared/i18n/messages.{pt,en}.ts`, `NEXT_PUBLIC_API_URL` em `apps/frontend/.env`.
- Fora de escopo: login funcional, sessão/JWT emitido, recuperação de senha, verificação de e-mail.
