# idea-resources Specification

## Purpose

Permite que cada Ideia reúna recursos de contexto (hoje, textos) que acompanham a Ideia e serão usados como material de apoio no processamento por IA.

## Requirements

### Requirement: Recursos pertencem à Ideia
Uma Ideia SHALL ter zero ou mais Recursos, cada um com `type`, `content` e `position`, que existem somente como parte da Ideia, sem endpoints próprios.

#### Scenario: Criar Ideia com recursos
- **WHEN** uma Ideia é criada com 0, 1 ou vários recursos válidos
- **THEN** a Ideia e todos os seus recursos são salvos

#### Scenario: Recurso sem Ideia
- **WHEN** alguém tenta acessar um recurso diretamente por uma rota de recursos
- **THEN** a rota não existe

### Requirement: Escrita dos recursos pela Ideia
`POST /ideas` e `PUT /ideas/:id` SHALL aceitar o campo `resources`, tratando a ausência do campo como lista vazia.

#### Scenario: Criar com recursos
- **WHEN** o dono envia `resources` válidos em `POST /ideas`
- **THEN** a Ideia é criada com esses recursos

#### Scenario: Campo ausente
- **WHEN** `resources` não é enviado
- **THEN** a Ideia fica sem recursos

### Requirement: Atualização por substituição
Em `PUT /ideas/:id`, a lista `resources` SHALL representar o estado final: recursos existentes enviados são atualizados, os novos são criados e os não enviados são removidos, junto com a atualização da Ideia, de forma atômica.

#### Scenario: Adicionar, alterar e remover no mesmo envio
- **WHEN** o dono envia uma lista que altera um recurso, acrescenta outro e omite um terceiro
- **THEN** a Ideia passa a ter exatamente os recursos enviados

#### Scenario: Falha na validação
- **WHEN** o envio tem um recurso inválido
- **THEN** a resposta é 422 e nem a Ideia nem seus recursos são alterados

### Requirement: Recursos de uma Ideia não afetam outras
A reconciliação SHALL atuar apenas nos recursos da própria Ideia, sem alterar ou apropriar-se de recursos de outras Ideias.

#### Scenario: Id de recurso de outra Ideia
- **WHEN** a lista enviada traz um `id` que pertence a um recurso de outra Ideia
- **THEN** o recurso da outra Ideia permanece intacto e a Ideia atual recebe um recurso novo

### Requirement: Leitura com recursos ordenados
`GET /ideas/:id` SHALL devolver `resources` com `id`, `type`, `content` e `position`, ordenados por posição e, em empate, pela criação; `GET /ideas` SHALL continuar sem recursos.

#### Scenario: Detalhe da Ideia
- **WHEN** o dono consulta uma Ideia com recursos
- **THEN** `resources` vem ordenado por `position`, sem datas dos recursos

#### Scenario: Listagem enxuta
- **WHEN** o dono lista as Ideias
- **THEN** os itens não trazem `resources`

### Requirement: Tipos de recurso suportados
O sistema SHALL aceitar apenas o tipo `text`, rejeitando com 422 e o código `idea.resource.type.unsupported` qualquer outro valor informado, e com `idea.resource.type.required` quando o tipo estiver ausente.

#### Scenario: Tipo não suportado
- **WHEN** um recurso é enviado com o tipo `image`
- **THEN** a resposta é 422 com `idea.resource.type.unsupported` e nada é salvo

#### Scenario: Tipo ausente
- **WHEN** um recurso é enviado sem `type`
- **THEN** a resposta é 422 com `idea.resource.type.required`

### Requirement: Validação do conteúdo e da posição
O sistema SHALL exigir `content` com 1 a 20000 caracteres e `position` inteira maior ou igual a zero, rejeitando com 422 e um código por problema.

#### Scenario: Conteúdo vazio
- **WHEN** um recurso é enviado com `content` vazio
- **THEN** a resposta é 422 com `idea.resource.content.required`

#### Scenario: Posição inválida
- **WHEN** a `position` é negativa ou não inteira
- **THEN** a resposta é 422 com o código correspondente de `idea.resource.position`

### Requirement: Limite de recursos por Ideia
O sistema SHALL aceitar no máximo 20 recursos por Ideia, rejeitando com 422 e o código `idea.resources.too_many` quando excedido.

#### Scenario: Vinte e um recursos
- **WHEN** a Ideia é enviada com 21 recursos
- **THEN** a resposta é 422 com `idea.resources.too_many`

#### Scenario: Vinte recursos
- **WHEN** a Ideia é enviada com 20 recursos válidos
- **THEN** a Ideia é salva

### Requirement: Ids de recurso sem repetição
O sistema SHALL rejeitar com 422 e o código `idea.resources.duplicate_id` uma lista em que dois recursos tenham o mesmo `id`.

#### Scenario: Id repetido
- **WHEN** dois recursos da mesma lista têm o mesmo `id`
- **THEN** a resposta é 422 com `idea.resources.duplicate_id`

### Requirement: Exclusão em cascata
Excluir uma Ideia SHALL excluir também todos os seus recursos.

#### Scenario: Excluir Ideia com recursos
- **WHEN** o dono exclui uma Ideia que tem recursos
- **THEN** a Ideia e seus recursos deixam de existir e a consulta por id responde 404

### Requirement: Regras da Ideia preservadas
As regras já existentes da Ideia (Tipo de Ideia válido, propriedade e autenticação) SHALL continuar valendo ao salvar com recursos.

#### Scenario: Ideia de outro usuário
- **WHEN** um usuário envia `PUT` com recursos para a Ideia de outro usuário
- **THEN** a resposta é 403 com `idea.forbidden` e os recursos não são alterados

### Requirement: Mensagens traduzidas dos recursos
Os códigos de erro dos recursos (`idea.resource.type.*`, `idea.resource.content.*`, `idea.resource.position.*`, `idea.resources.too_many` e `idea.resources.duplicate_id`) SHALL ter mensagem em português e em inglês no front-end.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de recurso é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
