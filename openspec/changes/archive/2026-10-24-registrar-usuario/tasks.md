# Tasks

## 1. Módulo auth

- [x] 1.1 Criar o módulo `auth` com a skill `config-new-module`; verificar `modules/auth` e o controller registrado no `AppModule`.
- [x] 1.2 Criar o agregado `user` com a skill `module-aggregate`, com apenas um caso de uso de exemplo; verificar a estrutura de pastas do agregado.
- [x] 1.3 Implementar a entidade `user` com a skill `module-entity` (`id`, `name` person name, `email` email, `password` hash pass); verificar que os testes unitários da entidade passam.
- [x] 1.4 Criar a interface `crypto.provider.ts` (criptografar e comparar senhas) em `modules/auth/.../user/provider`; verificar que o módulo compila.
- [x] 1.5 Implementar o caso de uso `register-user` com a skill `module-use-case` (validar entrada, checar usuário existente, criptografar senha, criar entidade, persistir; retorno `void`); verificar que os testes unitários passam.

## 2. Backend

- [x] 2.1 Sincronizar o módulo com o Prisma via `backend-prisma-sync-module`, com e-mail único; verificar que a migration é aplicada e `auth.model.prisma` existe.
- [x] 2.2 Implementar o repositório Prisma de `user` em `apps/backend/src/modules/auth` (sem subpasta) com `backend-prisma-repository`; verificar que o build do backend passa.
- [x] 2.3 Instalar `bcrypt` e implementar `crypto.provider.ts` em `apps/backend/src/modules/auth` (sem subpasta); verificar que o build passa.
- [x] 2.4 Criar `auth.controller.ts` com `backend-nest-controller`, endpoint público `POST /auth/register`, caso de uso instanciado no corpo do método; verificar que o build passa.
- [x] 2.5 Criar `auth.integration.http` cobrindo sucesso, e-mail duplicado (409), senha fraca (422) e múltiplos erros; executar e verificar as respostas.

## 3. Erros e i18n

- [x] 3.1 Listar os códigos de erro de `POST /auth/register` a partir de `auth.integration.http` e `api-exception.filter.ts`; registrar a lista como evidência.
- [x] 3.2 Adicionar as chaves ausentes em `messages.pt.ts` e `messages.en.ts` seguindo o padrão do arquivo; verificar que todos os códigos listados existem nos dois arquivos.

## 4. Frontend

- [x] 4.1 Definir `NEXT_PUBLIC_API_URL` em `apps/frontend/.env` (e `.env.example`); verificar que a variável é lida no build.
- [x] 4.2 Reescrever `app/(public)/join/page.tsx` com estado `mode` alternando cadastro/login; verificar a alternância no navegador.
- [x] 4.3 Implementar o formulário de cadastro com `fetch`, `toast.success` em 201 e um `toast.error(getMessage(code))` por item de `errors[]`, sem redirecionar; verificar no navegador.
- [x] 4.4 Implementar o formulário de login (`email`, `password`, botão) com handler `toast.info('Login em breve')`; verificar que nenhuma requisição é feita.

## 5. Integração

- [x] 5.1 Validar no navegador: alternância, cadastro válido, e-mail duplicado (409), senha fraca (422) e múltiplos erros com um toaster cada; registrar evidência.
- [x] 5.2 Rodar o build do monorepo e verificar ausência de erros de TypeScript e de build.
