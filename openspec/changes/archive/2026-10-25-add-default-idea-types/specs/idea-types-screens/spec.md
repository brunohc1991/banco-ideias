# Spec Delta

## ADDED Requirements

### Requirement: Carregar tipos padrão pela listagem
O estado vazio de `/idea-types` SHALL oferecer o botão "Carregar Tipos de Ideia padrão", que importa a biblioteca de tipos pré-definidos, informa o resultado e recarrega a listagem.

#### Scenario: Carregamento com sucesso
- **WHEN** o usuário sem tipos aciona o botão e são carregados tipos
- **THEN** um toaster de sucesso informa a quantidade carregada e a tabela passa a exibir os tipos

#### Scenario: Nada para carregar
- **WHEN** o carregamento responde que nenhum tipo foi carregado
- **THEN** um toaster informativo é exibido e a listagem é recarregada

#### Scenario: Clique repetido
- **WHEN** o carregamento está em andamento
- **THEN** o botão fica desabilitado, evitando duplo clique

#### Scenario: Erro no carregamento
- **WHEN** o backend responde com erro
- **THEN** um toaster de erro traduzido é exibido

### Requirement: Botão de carregar visível só sem tipos
O botão "Carregar Tipos de Ideia padrão" SHALL aparecer apenas quando o usuário não tem nenhum Tipo de Ideia.

#### Scenario: Usuário com tipos
- **WHEN** o usuário tem pelo menos um Tipo de Ideia
- **THEN** o botão não é exibido em nenhum lugar da tela

#### Scenario: Lista esvaziada
- **WHEN** o usuário exclui todos os seus tipos
- **THEN** o estado vazio volta a exibir o botão

### Requirement: Mensagens traduzidas do carregamento
As mensagens de sucesso e informativa do carregamento SHALL existir em português e em inglês.

#### Scenario: Idioma do navegador
- **WHEN** o feedback do carregamento é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português

## MODIFIED Requirements

### Requirement: Estado vazio
Quando o usuário não tem nenhum Tipo de Ideia, `/idea-types` SHALL exibir um estado vazio com os botões "Cadastrar Tipo de Ideia" e "Carregar Tipos de Ideia padrão", lado a lado.

#### Scenario: Sem tipos
- **WHEN** o usuário sem tipos abre `/idea-types`
- **THEN** o estado vazio é exibido com os dois botões, e "Cadastrar Tipo de Ideia" leva a `/idea-types/new`
