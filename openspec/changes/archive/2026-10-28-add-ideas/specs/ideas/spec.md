# Spec Delta

## Purpose

Permite que cada usuário registre e mantenha as próprias Ideias, cada uma vinculada a um Tipo de Ideia seu, como matéria-prima para o processamento por IA.

## ADDED Requirements

### Requirement: Criar Ideia
O sistema SHALL permitir que um usuário autenticado crie uma Ideia com `name`, `description`, `objective` e `ideaTypeId`, associando-a a esse usuário.

#### Scenario: Criação válida
- **WHEN** um usuário autenticado envia dados válidos e o id de um Tipo de Ideia seu para `POST /ideas`
- **THEN** a Ideia é criada e pertence ao usuário autenticado

### Requirement: Atualizar Ideia
O sistema SHALL permitir que o dono de uma Ideia a atualize por `PUT /ideas/:id`.

#### Scenario: Atualização válida
- **WHEN** o dono envia dados válidos para `PUT /ideas/:id`
- **THEN** a Ideia passa a refletir os novos dados

#### Scenario: Atualização de outro usuário
- **WHEN** um usuário tenta atualizar uma Ideia de outro usuário
- **THEN** a resposta é 403 com o código `idea.forbidden` e nada é alterado

### Requirement: Validação dos campos
O sistema SHALL exigir `name` com 3 a 120 caracteres, `description` com 10 a 2000, `objective` com 10 a 1000 e `ideaTypeId` em formato de identificador, rejeitando com 422 e um código por campo inválido.

#### Scenario: Campos ausentes
- **WHEN** a criação é enviada sem `name`, `description`, `objective` ou `ideaTypeId`
- **THEN** a resposta é 422 e `errors` traz o código de obrigatório de cada campo ausente

#### Scenario: Objetivo curto
- **WHEN** o `objective` tem menos de 10 caracteres
- **THEN** a resposta é 422 com o código de tamanho mínimo do campo `objective`

### Requirement: Tipo de Ideia válido e do próprio usuário
O sistema SHALL rejeitar com 422 e o código `idea.ideaType.invalid` uma Ideia cujo `ideaTypeId` não exista ou pertença a outro usuário.

#### Scenario: Tipo inexistente
- **WHEN** a Ideia é enviada com um `ideaTypeId` que não existe
- **THEN** a resposta é 422 com o código `idea.ideaType.invalid` e nada é salvo

#### Scenario: Tipo de outro usuário
- **WHEN** a Ideia é enviada com o `ideaTypeId` de um Tipo de Ideia de outro usuário
- **THEN** a resposta é 422 com o código `idea.ideaType.invalid` e nada é salvo

### Requirement: Excluir Ideia
O sistema SHALL permitir que o dono exclua uma Ideia por `DELETE /ideas/:id`, que deixa de aparecer em buscas e listagens.

#### Scenario: Exclusão válida
- **WHEN** o dono exclui uma Ideia existente
- **THEN** ela deixa de ser listada e não é mais encontrada por id

#### Scenario: Ideia inexistente
- **WHEN** a exclusão é pedida para um id que não existe
- **THEN** a resposta é 404 com o código `idea.not_found`

#### Scenario: Exclusão de outro usuário
- **WHEN** um usuário tenta excluir uma Ideia de outro usuário
- **THEN** a resposta é 403 com o código `idea.forbidden` e o registro permanece

### Requirement: Consulta por id
O sistema SHALL devolver uma Ideia por `GET /ideas/:id` com `id`, `name`, `description`, `objective`, `ideaTypeId` e `updatedAt`, sem expor o dono, apenas ao próprio dono.

#### Scenario: Consulta do dono
- **WHEN** o dono consulta uma Ideia existente
- **THEN** a resposta traz `id`, `name`, `description`, `objective`, `ideaTypeId` e `updatedAt`, sem `userId`

#### Scenario: Consulta de outro usuário
- **WHEN** um usuário consulta a Ideia de outro usuário
- **THEN** a resposta é 404 com o código `idea.not_found`, sem revelar que o registro existe

### Requirement: Listagem paginada própria
O sistema SHALL listar em `GET /ideas`, de forma paginada, apenas as Ideias do usuário autenticado, com `items`, `page`, `perPage` e `total`.

#### Scenario: Listagem isolada por usuário
- **WHEN** dois usuários têm Ideias e um deles lista as suas
- **THEN** a resposta contém somente as Ideias do usuário que listou

#### Scenario: Paginação
- **WHEN** o usuário pede uma página com um tamanho de página
- **THEN** a resposta traz no máximo esse número de itens e o `total` de Ideias do usuário

### Requirement: Acesso autenticado
Todos os endpoints de `/ideas` SHALL exigir usuário autenticado.

#### Scenario: Sem token
- **WHEN** uma requisição sem token chega a qualquer endpoint de `/ideas`
- **THEN** a resposta é 401 no formato de erro padronizado

### Requirement: Mensagens traduzidas
Os códigos de erro de Ideia (campos obrigatórios, tamanhos, formato de identificador, `idea.ideaType.invalid`, `idea.not_found` e `idea.forbidden`) SHALL ter mensagem em português e em inglês no front-end.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de Ideia é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
