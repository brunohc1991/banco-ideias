# Spec Delta

## Purpose

Dá aos formulários um campo de texto com ajuda de IA embutida, capaz de gerar um rascunho a partir do contexto do formulário ou de refinar o que a pessoa já escreveu.

## ADDED Requirements

### Requirement: Campo de texto com botão de IA
O sistema SHALL oferecer um campo de texto compartilhado, em linha única ou em várias linhas, com um botão de IA embutido no canto do campo.

#### Scenario: Variantes
- **WHEN** o campo é usado em modo de linha única ou de várias linhas
- **THEN** o botão de IA aparece embutido no campo nos dois casos

### Requirement: Gerar do zero
Com o campo vazio, o botão de IA SHALL abrir um popover com instrução adicional opcional e o botão "Gerar", que envia o prompt orientativo do campo e os valores dos campos de contexto e substitui o valor do campo pelo texto gerado.

#### Scenario: Geração com sucesso
- **WHEN** a pessoa aciona "Gerar" com o campo vazio
- **THEN** o campo passa a conter o texto gerado

#### Scenario: Instrução adicional
- **WHEN** a pessoa preenche a instrução adicional antes de gerar
- **THEN** a instrução é enviada junto com o pedido

### Requirement: Refinar o conteúdo atual
Com o campo preenchido, o botão de IA SHALL oferecer "Refinar", enviando o valor atual como contexto principal, à frente dos demais campos de contexto, com a orientação de preservar a intenção de quem escreveu e nunca começar do zero.

#### Scenario: Refinar texto existente
- **WHEN** a pessoa aciona "Refinar" em um campo preenchido
- **THEN** o texto atual é enviado como contexto principal e o campo passa a conter a versão refinada

#### Scenario: Rótulo do botão
- **WHEN** o campo tem valor
- **THEN** a ação se chama "Refinar" em vez de "Gerar"

### Requirement: Campos de contexto obrigatórios
O botão de IA SHALL ficar desabilitado enquanto algum campo de contexto obrigatório estiver vazio e SHALL indicar, em um balão de ajuda, quais campos estão pendentes.

#### Scenario: Contexto pendente
- **WHEN** um campo de contexto obrigatório está vazio
- **THEN** o botão está desabilitado e o balão lista os rótulos dos campos pendentes

### Requirement: Estado de carregamento
Durante a chamada, o campo e o botão SHALL ficar desabilitados, o ícone SHALL indicar progresso e a mensagem "Gerando..." SHALL aparecer abaixo do campo.

#### Scenario: Chamada em andamento
- **WHEN** a geração está em andamento
- **THEN** o campo e o botão não aceitam interação e "Gerando..." é exibido

### Requirement: Falha na geração
Em caso de erro, o campo SHALL manter seu valor, o popover SHALL permanecer aberto e um toaster de erro traduzido SHALL ser exibido.

#### Scenario: Erro do backend
- **WHEN** a geração falha
- **THEN** o valor do campo não muda, o popover continua aberto e um toaster de erro é exibido

### Requirement: Campos com IA no formulário de Tipo de Ideia
No formulário de Tipo de Ideia, `description` e `prompt` SHALL usar o campo com IA, com orientação fixa e contexto próprios: a descrição usa o nome; o prompt usa o nome e a descrição, ambos obrigatórios. O `name` permanece sem IA.

#### Scenario: Descrição sem nome
- **WHEN** o nome do Tipo de Ideia está vazio
- **THEN** o botão de IA da descrição está desabilitado e indica o campo "Nome"

#### Scenario: Descrição como parágrafo curto
- **WHEN** a descrição do Tipo de Ideia é gerada ou refinada
- **THEN** o pedido orienta um parágrafo curto de 3 a 4 linhas, com no máximo 400 caracteres, que diga o que é o tipo, para que serve e que resultado ele ajuda a produzir

#### Scenario: Prompt com marcadores
- **WHEN** o prompt é gerado ou refinado
- **THEN** o pedido orienta o uso dos marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}`

### Requirement: Campos com IA no formulário de Ideia
No formulário de Ideia, `description` e `objective` SHALL usar o campo com IA, com orientação fixa e contexto próprios: a descrição usa nome e nome do Tipo de Ideia; o objetivo usa nome, descrição e nome do Tipo de Ideia, todos obrigatórios. `name` e a seleção do tipo permanecem sem IA.

#### Scenario: Sem Tipo de Ideia escolhido
- **WHEN** nenhum Tipo de Ideia está selecionado
- **THEN** os botões de IA da descrição e do objetivo estão desabilitados e indicam o Tipo de Ideia como pendente

#### Scenario: Objetivo como frase de ação
- **WHEN** o objetivo é gerado
- **THEN** o pedido orienta uma frase curta iniciada por verbo no infinitivo
