# Tasks

## 1. Módulo de negócio (auth)

- [x] 1.1 Implementar o caso de uso `login-user` com a skill `module-use-case`: entrada `{ email, password }` (`RequiredRule` + `EmailRule` no e-mail, `RequiredRule` na senha), saída `{ id, name, email }`, `DomainError('user.credentials.invalid', 401)` para e-mail inexistente ou senha incorreta, sem nenhuma referência a token/JWT. Verificar com `grep -ri "token\|jwt" modules/auth/src` sem ocorrências novas e build do módulo sem erros.
- [x] 1.2 Testes unitários com `FakeUserRepository`/`FakeCryptoProvider`: login válido (sem `password`), e-mail inexistente, senha incorreta, e-mail vazio, e-mail inválido, senha vazia. Verificar com a suíte do módulo passando e cobertura de 100% no caso de uso.

## 2. Back-end

- [x] 2.1 Instalar `jsonwebtoken` e `@types/jsonwebtoken` em `@ideias/backend` e adicionar `JWT_SECRET` de exemplo (com aviso de troca em produção) em `apps/backend/.env.example` e `.env`. Verificar com o backend iniciando sem erro.
- [x] 2.2 Criar `apps/backend/src/modules/auth/jwt.util.ts` com `signUserToken(user, secret)`, payload `{ sub, name, email }` e expiração conforme `JWT_EXPIRES_IN` (padrão 7 dias). Verificar com teste unitário que decodifica o token e confirma payload e expiração.
- [x] 2.3 Adicionar `POST /auth/login` (público, 200) em `auth.controller.ts`: injetar `UserRepository`, `CryptoProvider` e `ConfigService`, instanciar `LoginUser` no corpo do método e responder `{ token, user }`. Verificar com `npx tsc --noEmit` e chamada manual válida.
- [x] 2.4 Estender `auth.integration.http` com login válido (200 com `token` e `user`), e-mail inexistente (401), senha incorreta (401), e-mail inválido (422) e corpo incompleto (422). Verificar executando os cenários no Rest Client com o backend rodando.

## 3. Front-end: sessão

- [x] 3.1 Instalar `js-cookie` e `@types/js-cookie` em `@ideias/frontend` e adicionar `user.credentials.invalid` em `messages.pt.ts` ("E-mail ou senha inválidos.") e `messages.en.ts` ("Invalid email or password."). Verificar com `npx tsc --noEmit` sem erros novos.
- [x] 3.2 Criar `modules/auth/util/jwt.util.ts` com `decodeJwtPayload` usando base64url → `Uint8Array` → `TextDecoder('utf-8')`, retornando `null` para token inválido. Verificar com teste unitário usando `José da Conceição` e token malformado.
- [x] 3.3 Criar `AuthContext`/`AuthProvider`/`useAuth` em `modules/auth/context` (estado `user`, `token`, `status`; reidratação do cookie `auth_token`; `login(token)` e `logout()` com cookie 7 dias, `sameSite: 'lax'`, `secure` em produção). Verificar manualmente que o cookie é gravado e removido e que o estado muda conforme esperado.
- [x] 3.4 Criar `AuthGuard` em `modules/auth/guard` (`loading` → `null`; `unauthenticated` → `router.replace('/join')` e `null`; `authenticated` → `children`) e exportar contexto e guard pelo barrel do módulo. Verificar com `npx tsc --noEmit`.

## 4. Front-end: telas e layouts

- [x] 4.1 Colocar `AuthProvider` em `app/layout.tsx` e `AuthGuard` em `app/(private)/layout.tsx`; no `AdminShell`, trocar `userName`/`userEmail` fixos por `useAuth()` e fazer `onLogout` chamar `logout()` e `router.push('/join')`. Verificar que o dropdown mostra nome e e-mail reais e que o logout remove o cookie.
- [x] 4.2 Integrar o login em `auth.component.tsx`: `POST {NEXT_PUBLIC_API_URL}/auth/login` com `fetch`; em 200 chamar `login(token)` e `router.push('/example/dashboard')`; em erro, um `toast.error(getMessage(code))` por item de `errors`. Verificar com senha errada (toaster e sem cookie) e login válido (redirecionamento).
- [x] 4.3 Em `/join`, redirecionar para `/example/dashboard` quando `status === 'authenticated'` e não renderizar o formulário durante `loading`. Verificar acessando `/join` logado.

## 5. Validação integrada

- [x] 5.1 Validar no navegador e registrar evidência: login válido (cookie, redirecionamento, dropdown com `José da Conceição` acentuado), senha errada, recarregar `/example/dashboard`, fechar e reabrir o navegador, acesso deslogado a `/example/dashboard` → `/join`, `/join` logado → dashboard, logout; e `npx tsc --noEmit` sem erros novos.
