# Tasks

## 1. Módulo `ideas`

- [x] 1.1 Criar o módulo `ideas` com a skill `config-new-module` (workspace `modules/ideas`, registro no backend e no front-end). Verificar com o build do projeto sem erros e o módulo registrado no `AppModule`.
- [x] 1.2 Ajustar o scaffold de front-end do módulo (`(private)/ideas`) para não deixar rota órfã. Verificar com o build do Next listando apenas as rotas esperadas.

## 2. Domínio (agregado `idea-type`)

- [x] 2.1 Criar o agregado `idea-type` (`module-aggregate`) e a entidade `IdeaType` (`module-entity`) com `id` (required + uuid), `name` (required, 3 a 120), `description` (required, 10 a 500), `prompt` (required, 20 a 8000) e `userId` (required + uuid), criando em `packages/shared` as regras que faltarem (`shared-validation-rule`). Verificar com os testes da entidade passando.
- [x] 2.2 Definir o repositório (`module-repository`) com `create`, `update`, `delete`, `findById` e `findPage({ userId, page, perPage })`, e o `FakeIdeaTypeRepository`. Verificar com `tsc` do módulo limpo.
- [x] 2.3 Implementar `SaveIdeaType` (`module-use-case`): atualiza quando o registro existe e é do mesmo `userId`, cria quando não existe, lança `DomainError('idea-type.forbidden', 403)` em registro de outro usuário. Verificar com testes de criação, atualização, campos inválidos e 403.
- [x] 2.4 Implementar `DeleteIdeaType`: `DomainError('idea-type.not_found', 404)` para id inexistente e `DomainError('idea-type.forbidden', 403)` para outro usuário. Verificar com testes dos três caminhos e cobertura de 100% nos dois casos de uso.

## 3. Back-end

- [x] 3.1 Sincronizar o módulo com o Prisma (`backend-prisma-sync-module`): model `IdeaType` (`@@map("idea_types")`, `prompt` como `@db.Text`, FK de `userId`, `createdAt`, `updatedAt`, `deletedAt`), migration `idea-types` aplicada. Verificar com a tabela criada no banco.
- [x] 3.2 Implementar `PrismaIdeaTypeRepository` (`backend-prisma-repository`) com exclusão lógica e `findPage` filtrando por `userId` e ignorando excluídos. Verificar com `npx tsc --noEmit` limpo no backend.
- [x] 3.3 Criar `idea-type.controller.ts` (`backend-nest-controller`) com `POST`, `PUT /:id`, `DELETE /:id`, `GET /:id` (404 para outro usuário) e `GET /` paginado por `page` e `perPage`, todos autenticados, mapeando a resposta para `{ id, name, description, prompt, updatedAt }`. Verificar com chamadas reais ao backend.
- [x] 3.4 Criar `idea-type.integration.http` com criação válida, campos ausentes (422), prompt fora do limite (422), atualização válida, atualização de outro usuário (403), exclusão válida, inexistente (404), de outro usuário (403), listagem paginada e busca por id. Verificar executando os cenários com o backend rodando.

## 4. Front-end

- [x] 4.1 Adicionar em `messages.pt.ts` e `messages.en.ts` as chaves `idea-type.{name,description,prompt}.{required,min.length,max.length}`, `idea-type.not_found` e `idea-type.forbidden`. Verificar com `npx tsc --noEmit` limpo.
- [x] 4.2 Criar a listagem paginada em `/idea-types` (Nome, Descrição truncada, Atualizado em, ações) com estado vazio e botão "Cadastrar Tipo de Ideia". Verificar no navegador com e sem registros.
- [x] 4.3 Criar o formulário compartilhado em `/idea-types/new` e `/idea-types/[id]/edit` (seções "Identificação" e "Prompt especializado", dica dos marcadores, um toaster por erro). Verificar criando e editando um tipo no navegador.
- [x] 4.4 Integrar as ações da tabela: editar leva ao formulário e excluir usa o diálogo de confirmação e recarrega a tabela. Verificar confirmando e cancelando uma exclusão.
- [x] 4.5 Adicionar o item "Tipos de Ideia" (`/idea-types`) ao menu lateral, depois de Dashboard. Verificar o item e seu estado ativo no navegador.

## 5. Validação integrada

- [x] 5.1 Rodar `npx tsc --noEmit` e o build em `apps/frontend`, e o build e os testes do backend e dos módulos, todos sem erros.
- [x] 5.2 Validar no navegador e registrar evidência: criar, listar, editar e excluir tipos; estado vazio; isolamento entre dois usuários; erros traduzidos por toaster.
