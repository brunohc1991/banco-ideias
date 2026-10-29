# idea-processing Specification

## Purpose

Transforma uma Ideia em conteúdo pronto com IA, guardando uma cópia congelada dos dados usados e o histórico de refinamentos de cada Processamento.

## Requirements

### Requirement: Criar Processamento
O sistema SHALL permitir que um usuário autenticado crie um Processamento a partir de uma Ideia sua por `POST /processings` com `ideaId`, gerando a primeira iteração com a IA e respondendo 201 com o detalhe do Processamento.

#### Scenario: Criação válida
- **WHEN** o usuário envia o `ideaId` de uma Ideia sua
- **THEN** a resposta é 201 com o Processamento contendo uma iteração de `position` 0, sem `refinement` e com `result` não vazio

#### Scenario: Várias vezes a mesma Ideia
- **WHEN** o usuário cria dois Processamentos para a mesma Ideia
- **THEN** existem dois Processamentos independentes, cada um com a própria trilha de iterações

### Requirement: Ideia válida e própria
O sistema SHALL rejeitar com 422 e o código `processing.idea.invalid` um Processamento cuja Ideia não exista, pertença a outro usuário ou cujo Tipo de Ideia não exista.

#### Scenario: Ideia inexistente
- **WHEN** o `ideaId` enviado não existe
- **THEN** a resposta é 422 com `processing.idea.invalid` e nada é salvo

#### Scenario: Ideia de outro usuário
- **WHEN** o `ideaId` enviado é de uma Ideia de outro usuário
- **THEN** a resposta é 422 com `processing.idea.invalid` e nada é salvo

### Requirement: Snapshot da Ideia
O Processamento SHALL guardar uma cópia do nome, da descrição e do objetivo da Ideia, do id e do nome do Tipo de Ideia, do prompt do tipo e dos recursos (`type`, `content` e `position`, em ordem), e essas informações SHALL NOT mudar quando a Ideia ou o tipo forem editados depois.

#### Scenario: Ideia editada depois
- **WHEN** a Ideia é editada após a criação do Processamento
- **THEN** o detalhe do Processamento continua mostrando os dados de quando foi criado

### Requirement: Composição do prompt da primeira geração
Na primeira geração, o sistema SHALL usar o prompt do tipo, com `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}` substituídos pelos dados do snapshot, como orientação do modelo, e o pedido "Gere o primeiro resultado para esta Ideia." como mensagem do usuário.

#### Scenario: Marcadores substituídos
- **WHEN** o prompt do tipo contém os quatro marcadores
- **THEN** cada um é trocado pelo valor correspondente do snapshot

#### Scenario: Recursos como lista numerada
- **WHEN** a Ideia tem recursos
- **THEN** `{{resources}}` vira uma lista numerada com o conteúdo de cada recurso, e fica vazio quando não há recursos

#### Scenario: Marcador desconhecido
- **WHEN** o prompt contém um marcador que não é um dos quatro
- **THEN** o marcador permanece literal

### Requirement: Refinar Processamento
O sistema SHALL permitir que o dono refine um Processamento por `POST /processings/:id/iterations` com `refinement`, gerando uma nova iteração que se soma ao histórico e respondendo 201 com a iteração criada (`id`, `refinement`, `result`, `position`, `createdAt`).

#### Scenario: Refinamento válido
- **WHEN** o dono envia um refinamento válido
- **THEN** uma nova iteração é criada na posição seguinte e as anteriores permanecem inalteradas

### Requirement: Composição do prompt do refinamento
No refinamento, o sistema SHALL manter o mesmo prompt de orientação e enviar como mensagem do usuário o histórico de todas as iterações anteriores (resultado e refinamento de cada uma) seguido do refinamento atual, pedindo uma nova versão que preserve o que já estava bom.

#### Scenario: Histórico enviado
- **WHEN** um Processamento com duas iterações é refinado
- **THEN** a mensagem enviada contém os resultados e os refinamentos das duas iterações e o refinamento atual

### Requirement: Validação do refinamento
O sistema SHALL exigir `refinement` com 3 a 2000 caracteres, rejeitando com 422 e os códigos `processing.refinement.required`, `processing.refinement.min.length` ou `processing.refinement.max.length`.

#### Scenario: Refinamento vazio
- **WHEN** o refinamento é enviado vazio
- **THEN** a resposta é 422 com `processing.refinement.required`

#### Scenario: Refinamento longo demais
- **WHEN** o refinamento tem 2001 caracteres
- **THEN** a resposta é 422 com `processing.refinement.max.length`

### Requirement: Limite de iterações
O sistema SHALL aceitar no máximo 50 iterações por Processamento, rejeitando com 422 e o código `processing.iterations.too_many` um refinamento além desse limite.

#### Scenario: Quinquagésima primeira iteração
- **WHEN** um Processamento com 50 iterações é refinado
- **THEN** a resposta é 422 com `processing.iterations.too_many` e nada é criado

### Requirement: Falha da IA preserva o histórico
Se a IA falhar, o sistema SHALL responder com o erro padronizado de IA e não deixar registro parcial: na criação o Processamento não é salvo, e no refinamento as iterações anteriores permanecem e a nova não é criada.

#### Scenario: Falha na criação
- **WHEN** a IA falha ao gerar a primeira iteração
- **THEN** a resposta é 502 e nenhum Processamento é criado

#### Scenario: Falha no refinamento
- **WHEN** a IA falha ao gerar um refinamento
- **THEN** a resposta é 502 e o Processamento mantém exatamente as iterações anteriores

### Requirement: Acesso restrito ao dono
Todas as operações sobre um Processamento SHALL ser restritas ao dono, e o acesso a Processamento inexistente ou de outro usuário SHALL responder 404 com o código `processing.not_found`, sem revelar a existência.

#### Scenario: Processamento de outro usuário
- **WHEN** um usuário consulta, refina ou exclui o Processamento de outro usuário
- **THEN** a resposta é 404 com `processing.not_found`

#### Scenario: Sem token
- **WHEN** uma requisição sem token chega a qualquer endpoint de `/processings`
- **THEN** a resposta é 401 no formato de erro padronizado

### Requirement: Consultar Processamento
O sistema SHALL devolver um Processamento por `GET /processings/:id` com `id`, `ideaId`, `ideaName`, `ideaDescription`, `ideaObjective`, `ideaTypeId`, `ideaTypeName`, `resources`, `iterations` ordenadas por `position`, `createdAt` e `updatedAt`, sem expor o dono nem o prompt do tipo.

#### Scenario: Detalhe do dono
- **WHEN** o dono consulta seu Processamento
- **THEN** a resposta traz o snapshot e as iterações em ordem, sem `userId` e sem prompt

### Requirement: Listar Processamentos
O sistema SHALL listar em `GET /processings`, de forma paginada, apenas os Processamentos do usuário, com `id`, `ideaId`, `ideaName`, `ideaTypeName`, `iterationsCount`, `createdAt` e `updatedAt`, sem iterações nem recursos, e SHALL atualizar `updatedAt` a cada nova iteração.

#### Scenario: Listagem enxuta e isolada
- **WHEN** o usuário lista seus Processamentos
- **THEN** os itens trazem a contagem de iterações, não trazem iterações e só incluem os Processamentos dele

### Requirement: Buscar Ideia para processar
O sistema SHALL oferecer `GET /processings/idea-search?term=`, que devolve até 20 Ideias do usuário, `{ id, name, ideaTypeId, ideaTypeName }`, cujo nome ou nome do Tipo de Ideia contenha o termo sem diferenciar maiúsculas, da mais recentemente alterada para a mais antiga, e as 20 mais recentes quando o termo vier vazio.

#### Scenario: Busca por parte do nome
- **WHEN** o usuário busca por parte do nome da Ideia ou do tipo
- **THEN** a resposta lista somente as Ideias dele que combinam, no máximo 20

#### Scenario: Termo vazio
- **WHEN** o termo vem vazio
- **THEN** a resposta traz as 20 Ideias mais recentes do usuário

### Requirement: Excluir Processamento
O sistema SHALL permitir que o dono exclua um Processamento por `DELETE /processings/:id`, respondendo 204 e removendo também suas iterações e o snapshot de recursos.

#### Scenario: Exclusão do dono
- **WHEN** o dono exclui seu Processamento
- **THEN** a resposta é 204 e a consulta por id passa a responder 404

### Requirement: Ideia com Processamentos não é excluída
O sistema SHALL recusar com 409 e o código `idea.has_processings` a exclusão de uma Ideia que tenha Processamentos, mantendo a Ideia.

#### Scenario: Excluir Ideia com Processamento
- **WHEN** o dono tenta excluir uma Ideia que tem Processamentos
- **THEN** a resposta é 409 com `idea.has_processings` e a Ideia permanece

#### Scenario: Excluir depois de apagar os Processamentos
- **WHEN** todos os Processamentos da Ideia foram excluídos
- **THEN** a Ideia pode ser excluída normalmente

### Requirement: Mensagens traduzidas do Processamento
Os códigos de erro de Processamento (`processing.idea.invalid`, `processing.not_found`, `processing.iterations.*`, `processing.refinement.*`) e `idea.has_processings` SHALL ter mensagem em português e em inglês no front-end.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de Processamento é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
