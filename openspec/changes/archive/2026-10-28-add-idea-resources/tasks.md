# Tasks

## 1. Domínio (módulo `ideas`)

- [x] 1.1 Criar a entidade `Resource` (`module-entity`) em `modules/ideas/src/idea/model/` com `type` (união com `'text'` e lista exportada de tipos), `content` (required, 1 a 20000) e `position` (required, inteiro >= 0, com as regras compartilhadas existentes). Verificar com testes de conteúdo vazio e longo demais, tipo inválido, posição negativa e posição não inteira.
- [x] 1.2 Estender `Idea` com `resources` (padrão lista vazia, com getter) e `validate()` que rejeita mais de 20 recursos (`idea.resources.too_many`), ids repetidos (`idea.resources.duplicate_id`) e delega a validação a cada recurso. Verificar com testes de lista vazia, 20, 21, id duplicado e item inválido.
- [x] 1.3 Atualizar `IdeaRepository` e o `FakeIdeaRepository`: `create` e `update` persistem os recursos (o `update` reconcilia por substituição), `findById` devolve os recursos ordenados e `findPage` não os devolve. Verificar com testes do fake para adicionar, alterar e remover no mesmo `update`.
- [x] 1.4 Atualizar `SaveIdea` para receber `resources`, rejeitar tipo informado e não suportado com `idea.resource.type.unsupported` antes de criar a entidade, montar os recursos (gerando `id` quando vazio) e manter as regras existentes; confirmar que `DeleteIdea` remove os recursos junto. Verificar com testes de 0, 1 e N recursos, replace-all, tipo não suportado, tipo ausente, regressão de outro usuário e tipo inexistente, e exclusão com recursos, com cobertura de 100% nos arquivos alterados.

## 2. Back-end

- [x] 2.1 Sincronizar o Prisma (`backend-prisma-sync-module`) com o model `Resource` (`ideaId` com cascata, `type`, `content` como texto, `position`, datas, índice por `ideaId` e `position`, `@@map("resources")`) e a relação inversa em `Idea`; aplicar a migration `resources`. Verificar com a tabela criada no banco.
- [x] 2.2 Atualizar o `PrismaIdeaRepository`: `create` e `update` transacionais com a reconciliação restrita ao `ideaId` (id que não pertence à Ideia vira recurso novo com id gerado), `findById` com recursos ordenados e `findPage` sem recursos. Verificar com `npx tsc --noEmit` limpo no backend.
- [x] 2.3 Atualizar `idea.controller.ts`: `resources` opcional em `POST` e `PUT`, detalhe de `GET /ideas/:id` com `resources` (`id`, `type`, `content`, `position`) e `GET /ideas` sem recursos. Verificar com chamadas reais ao backend.
- [x] 2.4 Estender `idea.integration.http` com criação com 0, 1 e 3 recursos, atualização que altera, adiciona e remove, tipo não suportado (422), 21 recursos (422), conteúdo vazio (422), detalhe ordenado, listagem sem recursos e exclusão com recursos seguida de 404. Verificar executando os cenários com o backend rodando.
- [x] 2.5 Adicionar em `messages.pt.ts` e `messages.en.ts` as chaves de `idea.resource.type.{required,unsupported}`, `idea.resource.content.{required,min.length,max.length}`, `idea.resource.position.{required,integer,min.value}`, `idea.resources.too_many` e `idea.resources.duplicate_id`. Verificar com `npx tsc --noEmit` limpo no front-end.

## 3. Front-end

- [x] 3.1 Estender os tipos e a API de Ideia do front-end com `resources` (envio em criar e atualizar, leitura no detalhe, listagem sem recursos). Verificar com `npx tsc --noEmit` limpo.
- [x] 3.2 Criar o componente `IdeaResourcesInput` (controlado) com adicionar, editar, remover, mover para cima e para baixo, estado vazio e rótulos acessíveis. Verificar com `npx tsc --noEmit` limpo e o comportamento no navegador.
- [x] 3.3 Adicionar a seção "Recursos" ao formulário de Ideia, hidratando os recursos na edição e enviando-os no salvar. Verificar no navegador criando e editando uma Ideia com recursos e vendo os erros traduzidos por toaster.

## 4. Memória e validação integrada

- [x] 4.1 Registrar em `openspec/memory/modules/ideas.md` que Recurso é entidade interna do agregado `idea` (campos `type`, `content`, `position`; hoje só `text`; novos tipos estendem a união sem mudar a estrutura plana). Verificar relendo a seção de Ideias.
- [x] 4.2 Rodar `npx tsc --noEmit` e o build do front-end, o build e os testes do backend e dos módulos, todos sem erros.
- [x] 4.3 Validar no navegador e registrar evidência: adicionar, editar, reordenar e remover recursos e salvar; recarregar a edição e ver a mesma ordem; erro de limite com toaster traduzido; exclusão da Ideia; listagem sem mudança.
