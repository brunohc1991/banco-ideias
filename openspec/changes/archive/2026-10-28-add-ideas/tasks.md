# Tasks

## 1. Domínio (agregado `idea`)

- [x] 1.1 Criar o agregado `idea` no módulo `ideas` (`module-aggregate`) e a entidade `Idea` (`module-entity`) com `id` (required + uuid), `name` (required, 3 a 120), `description` (required, 10 a 2000), `objective` (required, 10 a 1000), `ideaTypeId` (required + uuid) e `userId` (required + uuid). Verificar com os testes da entidade passando e o módulo compilando.
- [x] 1.2 Definir o repositório (`module-repository`) com `create`, `update`, `delete`, `findById` e `findPage({ userId, page, perPage })`, e o `FakeIdeaRepository`. Verificar com `tsc` do módulo limpo.
- [x] 1.3 Implementar `SaveIdea` (`module-use-case`) com `IdeaRepository` e `IdeaTypeRepository`: valida a entidade, lança `DomainError('idea.ideaType.invalid', 422)` para tipo inexistente ou de outro usuário, atualiza Ideia do mesmo usuário, cria quando não existe e lança `DomainError('idea.forbidden', 403)` para Ideia de outro usuário. Verificar com testes de criação, atualização, cada campo obrigatório, tipo inexistente, tipo de outro usuário e 403.
- [x] 1.4 Implementar `DeleteIdea`: `DomainError('idea.not_found', 404)` para id inexistente e `DomainError('idea.forbidden', 403)` para outro usuário. Verificar com testes dos três caminhos e cobertura de 100% nos dois casos de uso.

## 2. Back-end

- [x] 2.1 Sincronizar o agregado com o Prisma (`backend-prisma-sync-module`): model `Idea` (`@@map("ideas")`, FKs para `idea_types` e `users` com `Restrict`, `deletedAt`), relações inversas em `IdeaType` e `User`, migration `ideas` aplicada. Verificar com a tabela criada no banco.
- [x] 2.2 Implementar `PrismaIdeaRepository` (`backend-prisma-repository`) com exclusão lógica e `findPage` filtrando por `userId` e ignorando excluídas, registrado no `IdeasModule`. Verificar com `npx tsc --noEmit` limpo no backend.
- [x] 2.3 Criar `idea.controller.ts` (`backend-nest-controller`) com `POST`, `PUT /:id`, `DELETE /:id`, `GET /:id` (404 para outro usuário) e `GET /` paginado por `page` e `perPage`, todos autenticados, mapeando a resposta para `{ id, name, description, objective, ideaTypeId, updatedAt }` sem `userId`. Verificar com chamadas reais ao backend.
- [x] 2.4 Criar `idea.integration.http` com criação válida, `ideaTypeId` inexistente (422), campos ausentes (422), atualização válida, atualização por outro usuário (403), exclusão válida, inexistente (404), por outro usuário (403), listagem paginada e busca por id. Verificar executando os cenários com o backend rodando.

## 3. Front-end

- [x] 3.1 Adicionar em `messages.pt.ts` e `messages.en.ts` as chaves `idea.{name,description,objective}.{required,min.length,max.length}`, `idea.ideaTypeId.{required,uuid}`, `idea.userId.{required,uuid}`, `idea.ideaType.invalid`, `idea.not_found` e `idea.forbidden`, e criar o wrapper de API de Ideias. Verificar com `npx tsc --noEmit` limpo.
- [x] 3.2 Criar a listagem paginada em `/ideas` (Nome, Tipo de Ideia pelo nome, Atualizado em, ações) com estado vazio e botão "Cadastrar Ideia". Verificar no navegador com e sem registros.
- [x] 3.3 Criar o formulário compartilhado em `/ideas/new` e `/ideas/[id]/edit` (seções "Identificação", "Detalhes" e "Classificação", seleção do Tipo de Ideia com estado de "Nenhum Tipo de Ideia cadastrado" e um toaster por erro). Verificar criando e editando uma Ideia no navegador.
- [x] 3.4 Integrar as ações da tabela (editar e excluir com confirmação e recarga) e adicionar o item "Ideias" ao menu depois de "Tipos de Ideia", com destaque por prefixo. Verificar confirmando e cancelando uma exclusão e o item ativo em `/ideas/new`.

## 4. Validação integrada

- [x] 4.1 Rodar `npx tsc --noEmit` e o build do front-end, o build e os testes do backend e dos módulos, todos sem erros.
- [x] 4.2 Validar no navegador e registrar evidência: criar, listar, editar e excluir Ideias; estado vazio; usuário sem Tipos de Ideia; isolamento entre dois usuários; tipo de outro usuário recusado; erros traduzidos por toaster.
