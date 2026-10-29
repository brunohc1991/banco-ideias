# Design

## Context

O módulo `auth` já tem o agregado `user`, `UserRepository`, `CryptoProvider` e o caso de uso de cadastro. O backend já tem guard JWT global (rotas públicas via `@Public()`) e lê `JWT_SECRET`/`JWT_EXPIRES_IN`. O front-end usa `fetch` nativo e toasters com códigos de erro traduzidos (padrão do cadastro). Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Manter o domínio livre de qualquer conceito de token/sessão.
- Sessão do front-end reidratável a partir de um cookie legível pelo client.

**Non-Goals:**
- Refresh token, revogação de token, cookie `httpOnly` e rate limiting de login.
- Nova biblioteca de chamada HTTP.

## Decisions

- **Token só no controller.** `LoginUser` devolve `{ id, name, email }`; `auth.controller.ts` instancia o caso de uso no corpo do método (como no cadastro) e chama `signUserToken` (helper local `jwt.util.ts`) com `sub`, `name`, `email`. Alternativa descartada: `TokenProvider` no domínio, que vazaria transporte HTTP para o negócio.
- **Erro único `user.credentials.invalid` (401)** para e-mail inexistente e senha errada, evitando enumeração de e-mails.
- **Expiração via configuração existente.** O helper usa o tempo de `JWT_EXPIRES_IN` já lido pelo backend, com padrão de 7 dias, alinhado ao cookie de 7 dias. O documento de origem cita `7 dias` na seção técnica e `14d` numa task; adotou-se 7 dias por consistência com o cookie e o padrão declarado.
- **Cookie via `js-cookie`, sem `httpOnly`.** O client precisa lê-lo para reidratar o contexto. Trade-off aceito: exposição a XSS, mitigada pelo payload mínimo.
- **Decode com `TextDecoder('utf-8')`** sobre base64url → `Uint8Array`, em vez de `atob` cru, para preservar acentos.
- **`AuthProvider` no layout raiz** para ser compartilhado por `(public)` e `(private)`; `AuthGuard` envolve apenas `(private)/layout.tsx`. Durante `loading` ambos renderizam `null`, sem flash.
- **Contexto/guard em `apps/frontend/src/modules/auth/{context,guard,util}`**, exportados pelo barrel do módulo.

## Risks / Trade-offs

- [Token legível por JS (XSS)] → payload mínimo, sem dados sensíveis; `httpOnly` fica como evolução futura.
- [Decode no client não valida assinatura] → o backend é a autoridade; token adulterado é rejeitado nas chamadas protegidas.
- [Token expirado no cookie antes de 7 dias, se `JWT_EXPIRES_IN` for menor] → mantê-los alinhados na configuração.
