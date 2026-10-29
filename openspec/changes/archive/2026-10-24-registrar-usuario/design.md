# Design

## Context

O monorepo (`@ideias`) já tem a fundação do backend (filtro `ApiErrorResponse`, guard JWT global, decorator `Public`), Prisma configurado, o pacote `shared` e o shell do frontend com `/join` e `Toaster` montado. Ainda não existe nenhum módulo de negócio. Ver `proposal.md` para a motivação.

## Goals / Non-Goals

**Goals:**
- Entregar o fluxo completo de cadastro, do formulário ao banco.

**Non-Goals:**
- Login funcional, emissão de JWT e validação client-side.

## Decisions

- **Módulo `auth` via `config-new-module`, agregado `user` via `module-aggregate`**: segue o scaffold padrão do projeto. As interfaces do módulo (repositório de `user` e `crypto.provider.ts`) são o contrato e não mudam nas implementações.
- **Implementações técnicas sem subpasta** em `apps/backend/src/modules/auth` (repositório Prisma e provider bcrypt): conforme a convenção das skills `backend-prisma-repository` e `backend-provider-implementation`.
- **Controller simples**: `auth.controller.ts` injeta repositório e provider de criptografia e instancia `register-user` no corpo do método, passando as dependências por parâmetro. Alternativa (registrar o caso de uso como provider Nest) descartada para manter o módulo de negócio livre de decorators do framework.
- **Endpoint público**: marcado com `@Public()`, pois o guard JWT é global.
- **Retorno `void` / 201 sem corpo**: o caso de uso não devolve dados, evitando expor o hash.
- **Mapeamento de erros**: as chaves de erro do `ApiErrorResponse` são levantadas lendo `auth.integration.http` e o filtro de exceções; as ausentes são adicionadas a `messages.pt.ts` e `messages.en.ts`.
- **Frontend**: `fetch` nativo, estado `mode` na própria `page.tsx`, `NEXT_PUBLIC_API_URL` para a base da API; nenhum componente novo fora de `app/(public)/join/`.

## Risks / Trade-offs

- [Códigos de erro do backend sem tradução] → task dedicada que cruza os códigos reais com os arquivos de i18n.
- [Condição de corrida no e-mail duplicado] → restrição de unicidade no model Prisma além da checagem no caso de uso.
- [`NEXT_PUBLIC_API_URL` ausente] → definir em `apps/frontend/.env` (e `.env.example`).
