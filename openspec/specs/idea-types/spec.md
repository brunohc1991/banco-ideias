# idea-types Specification

## Purpose
Permite que cada usuário cadastre e mantenha os próprios Tipos de Ideia, categorias reutilizáveis que carregam o prompt especializado usado no processamento por IA.

## Requirements

### Requirement: Criar Tipo de Ideia
O sistema SHALL permitir que um usuário autenticado crie um Tipo de Ideia com `name`, `description` e `prompt`, associando-o a esse usuário.

#### Scenario: Criação válida
- **WHEN** um usuário autenticado envia `name`, `description` e `prompt` válidos para `POST /idea-types`
- **THEN** o Tipo de Ideia é criado e pertence ao usuário autenticado

### Requirement: Atualizar Tipo de Ideia
O sistema SHALL permitir que o dono de um Tipo de Ideia o atualize por `PUT /idea-types/:id`.

#### Scenario: Atualização válida
- **WHEN** o dono envia dados válidos para `PUT /idea-types/:id`
- **THEN** o Tipo de Ideia passa a refletir os novos dados

#### Scenario: Atualização de outro usuário
- **WHEN** um usuário tenta atualizar um Tipo de Ideia de outro usuário
- **THEN** a resposta é 403 com o código `idea-type.forbidden` e nada é alterado

### Requirement: Validação dos campos
O sistema SHALL exigir `name` com 3 a 120 caracteres, `description` com 10 a 500 e `prompt` com 20 a 8000, rejeitando com 422 e um código por campo inválido.

#### Scenario: Campos ausentes
- **WHEN** a criação é enviada sem `name`, `description` ou `prompt`
- **THEN** a resposta é 422 e `errors` traz o código de obrigatório de cada campo ausente

#### Scenario: Prompt fora do limite
- **WHEN** o `prompt` tem menos de 20 ou mais de 8000 caracteres
- **THEN** a resposta é 422 com o código de tamanho do campo `prompt`

### Requirement: Prompt como texto livre
O sistema SHALL armazenar o `prompt` como texto livre, sem exigir nem substituir os marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}`.

#### Scenario: Prompt sem marcadores
- **WHEN** o `prompt` é válido em tamanho mas não contém marcadores
- **THEN** o Tipo de Ideia é salvo normalmente

### Requirement: Excluir Tipo de Ideia
O sistema SHALL permitir que o dono exclua um Tipo de Ideia por `DELETE /idea-types/:id`, que deixa de aparecer em buscas e listagens.

#### Scenario: Exclusão válida
- **WHEN** o dono exclui um Tipo de Ideia existente
- **THEN** ele deixa de ser listado e não é mais encontrado por id

#### Scenario: Tipo inexistente
- **WHEN** a exclusão é pedida para um id que não existe
- **THEN** a resposta é 404 com o código `idea-type.not_found`

#### Scenario: Exclusão de outro usuário
- **WHEN** um usuário tenta excluir um Tipo de Ideia de outro usuário
- **THEN** a resposta é 403 com o código `idea-type.forbidden` e o registro permanece

### Requirement: Consulta por id
O sistema SHALL devolver um Tipo de Ideia por `GET /idea-types/:id` com `id`, `name`, `description`, `prompt` e `updatedAt`, apenas ao dono.

#### Scenario: Consulta do dono
- **WHEN** o dono consulta um Tipo de Ideia existente
- **THEN** a resposta traz `id`, `name`, `description`, `prompt` e `updatedAt`

#### Scenario: Consulta de outro usuário
- **WHEN** um usuário consulta o Tipo de Ideia de outro usuário
- **THEN** a resposta é 404, sem revelar que o registro existe

### Requirement: Listagem paginada própria
O sistema SHALL listar em `GET /idea-types`, de forma paginada, apenas os Tipos de Ideia do usuário autenticado, com `items`, `page`, `perPage` e `total`.

#### Scenario: Listagem isolada por usuário
- **WHEN** dois usuários têm Tipos de Ideia e um deles lista os seus
- **THEN** a resposta contém somente os tipos do usuário que listou

#### Scenario: Paginação
- **WHEN** o usuário pede uma página com um tamanho de página
- **THEN** a resposta traz no máximo esse número de itens e o `total` de tipos do usuário

### Requirement: Acesso autenticado
Todos os endpoints de `/idea-types` SHALL exigir usuário autenticado.

#### Scenario: Sem token
- **WHEN** uma requisição sem token chega a qualquer endpoint de `/idea-types`
- **THEN** a resposta é 401 no formato de erro padronizado

### Requirement: Mensagens traduzidas
Os códigos de erro de Tipo de Ideia (campos obrigatórios, tamanhos, `idea-type.not_found` e `idea-type.forbidden`) SHALL ter mensagem em português e em inglês no front-end.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de Tipo de Ideia é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
