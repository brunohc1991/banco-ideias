# idea-processing-screens Specification

## Purpose

Define as telas privadas para criar Processamentos a partir de uma Ideia, acompanhar a linha do tempo de resultados e refiná-los.

## Requirements

### Requirement: Listagem de Processamentos
A rota privada `/processings` SHALL exibir uma tabela paginada com **Ideia**, **Tipo**, **Iterações** (contagem), **Atualizado em** e ações de ver e excluir, mostrando apenas os Processamentos do usuário, com o botão "Novo Processamento" no topo.

#### Scenario: Usuário com Processamentos
- **WHEN** o usuário abre `/processings` com Processamentos criados
- **THEN** a tabela mostra nome da Ideia, tipo, contagem de iterações, data e as ações

#### Scenario: Estado vazio
- **WHEN** o usuário sem Processamentos abre `/processings`
- **THEN** um estado vazio é exibido com o botão "Novo Processamento"

#### Scenario: Excluir com confirmação
- **WHEN** o usuário confirma a exclusão de um Processamento
- **THEN** ele sai da lista e a tabela é recarregada

### Requirement: Busca de Ideia na criação
A rota `/processings/new` SHALL oferecer um campo de busca de Ideia por nome da Ideia ou do tipo, com pausa de 300 ms após a digitação, que já mostra as Ideias mais recentes ao abrir e lista os resultados para seleção.

#### Scenario: Abrir a tela
- **WHEN** o usuário abre `/processings/new`
- **THEN** as Ideias mais recentes dele já aparecem na lista

#### Scenario: Digitar um termo
- **WHEN** o usuário digita parte de um nome
- **THEN** a lista passa a mostrar só as Ideias que combinam

### Requirement: Processar a Ideia selecionada
Ao selecionar uma Ideia e acionar "Processar", a tela SHALL iniciar o Processamento mostrando um indicador de progresso e a mensagem "Processando ideia...", e SHALL levar o usuário a `/processings/[id]` ao concluir.

#### Scenario: Sucesso
- **WHEN** o Processamento é criado com sucesso
- **THEN** o usuário é levado a `/processings/[id]` com a primeira iteração já exibida

#### Scenario: Erro
- **WHEN** a criação falha
- **THEN** um toaster de erro traduzido é exibido e a Ideia selecionada é mantida na tela

### Requirement: Detalhe do Processamento
A rota `/processings/[id]` SHALL exibir o nome da Ideia, o tipo, o objetivo, um link "Ver Ideia original" e um resumo recolhido com a descrição e os recursos, seguidos da linha do tempo das iterações, da mais antiga para a mais recente.

#### Scenario: Processamento inexistente
- **WHEN** o Processamento não existe ou é de outro usuário
- **THEN** um toaster de erro é exibido e o usuário volta a `/processings`

### Requirement: Linha do tempo em Markdown
Cada iteração SHALL exibir o número da iteração, o refinamento aplicado (a partir da segunda), o resultado renderizado como Markdown, com títulos, listas, ênfase, código, tabelas e tachado, em tema escuro, e a data.

#### Scenario: Resultado formatado
- **WHEN** o resultado contém títulos, listas e tabelas em Markdown
- **THEN** eles são exibidos formatados, e não como texto cru

#### Scenario: Primeira iteração
- **WHEN** a primeira iteração é exibida
- **THEN** ela não mostra refinamento

### Requirement: Reprocessar com refinamento
O rodapé do detalhe SHALL ter um campo "Refinamento adicional" e o botão "Reprocessar", que cria uma nova iteração, a acrescenta ao fim da linha do tempo, limpa o campo e rola até ela, ficando desabilitado durante a chamada.

#### Scenario: Refinamento com sucesso
- **WHEN** o usuário envia um refinamento válido
- **THEN** a nova iteração aparece ao fim com o refinamento em itálico, o campo é limpo e a tela rola até ela

#### Scenario: Erro no refinamento
- **WHEN** o refinamento falha
- **THEN** um toaster de erro traduzido é exibido e a linha do tempo permanece como estava

### Requirement: Erro ao excluir Ideia com Processamentos
Quando a exclusão de uma Ideia for recusada por `idea.has_processings`, a tela de Ideias SHALL exibir um toaster de erro traduzido.

#### Scenario: Ideia com Processamentos
- **WHEN** o usuário tenta excluir uma Ideia que tem Processamentos
- **THEN** um toaster explica que é preciso excluir os Processamentos antes
