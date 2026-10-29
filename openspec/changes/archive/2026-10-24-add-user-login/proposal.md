# Proposal

## Why

O cadastro de usuário já existe (spec 002), mas o formulário de login em `/join` é apenas visual e as rotas privadas estão abertas. Sem login e sessão, não há como identificar quem usa o sistema nem proteger a área administrativa.

## What Changes

- Novo caso de uso de login no módulo de negócio `auth`: recebe `email` e `password` e devolve apenas `id`, `name` e `email`, sem qualquer noção de token, JWT ou sessão.
- Novo endpoint público `POST /auth/login`: executa o caso de uso, gera o JWT na camada HTTP a partir da saída do caso de uso e responde `{ token, user }`.
- Novo `JWT_SECRET` de exemplo em `.env.example` (o backend já lê `JWT_SECRET`/`JWT_EXPIRES_IN`).
- Front-end: contexto de autenticação, guard de rotas privadas e sessão persistida em cookie (`auth_token`) que sobrevive ao fechamento do navegador.
- O formulário de login em `/join` passa a chamar o backend; sessão ativa em `/join` redireciona para a área administrativa.
- O `AdminShell` passa a exibir nome e e-mail reais do usuário logado (com acentuação preservada) e o logout limpa a sessão.
- Nova mensagem de erro traduzida (pt/en) para credenciais inválidas.
- **BREAKING**: o requisito "Login apenas visual" do `join-page` é substituído; rotas do grupo `(private)` passam a exigir sessão.

## Capabilities

### New Capabilities
- `user-login`: autenticação por e-mail e senha, resposta com token e dados públicos do usuário, e erro único para credenciais inválidas.
- `user-session`: sessão do usuário no front-end (persistência em cookie, reidratação, decodificação do token com acentuação, logout e proteção de rotas privadas).

### Modified Capabilities
- `join-page`: o login deixa de ser visual e passa a autenticar no backend; `/join` redireciona quando já há sessão.
- `frontend-shell`: o grupo de rotas `(private)` passa a exigir sessão ativa e o header exibe o usuário logado.

## Impact

- `modules/auth`: novo caso de uso `login-user` e testes unitários.
- `apps/backend`: `auth.controller.ts`, novo helper `jwt.util.ts`, `auth.integration.http`, `.env`/`.env.example`, dependência `jsonwebtoken`.
- `apps/frontend`: `modules/auth` (contexto, guard, util JWT, componente de login), layouts `app/layout.tsx` e `app/(private)/layout.tsx`, `AdminShell`, i18n pt/en, dependência `js-cookie`.
- Origem do requisito: `.docs/003-login-usuario/spec.md`.
