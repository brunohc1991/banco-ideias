# idea-types-screens Specification

## Purpose
Define as telas privadas em que o usuário lista, cria, edita e exclui os próprios Tipos de Ideia.

## Requirements

### Requirement: Listagem de Tipos de Ideia
A rota privada `/idea-types` SHALL exibir uma tabela paginada com **Nome**, **Descrição** (truncada), **Atualizado em** e ações de editar e excluir, mostrando apenas os tipos do usuário logado.

#### Scenario: Usuário com tipos
- **WHEN** o usuário abre `/idea-types` e possui tipos cadastrados
- **THEN** a tabela exibe nome, descrição truncada, data de atualização e as ações

#### Scenario: Mudar de página
- **WHEN** o usuário troca de página na paginação
- **THEN** a tabela mostra os tipos da página escolhida

### Requirement: Estado vazio
Quando o usuário não tem nenhum Tipo de Ideia, `/idea-types` SHALL exibir um estado vazio com os botões "Cadastrar Tipo de Ideia" e "Carregar Tipos de Ideia padrão", lado a lado.

#### Scenario: Sem tipos
- **WHEN** o usuário sem tipos abre `/idea-types`
- **THEN** o estado vazio é exibido com os dois botões, e "Cadastrar Tipo de Ideia" leva a `/idea-types/new`

### Requirement: Formulário compartilhado
Criação em `/idea-types/new` e edição em `/idea-types/[id]/edit` SHALL usar o mesmo formulário, com seção "Identificação" (`name`, `description`) e seção "Prompt especializado" (`prompt`, campo de texto multilinha).

#### Scenario: Criar
- **WHEN** o usuário envia o formulário em `/idea-types/new`
- **THEN** o tipo é criado

#### Scenario: Editar
- **WHEN** o usuário abre `/idea-types/[id]/edit`
- **THEN** o formulário vem preenchido e o envio atualiza o tipo

### Requirement: Dica dos marcadores
O campo de prompt SHALL exibir uma dica discreta listando os marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}`.

#### Scenario: Dica visível
- **WHEN** o formulário é exibido
- **THEN** a dica com os quatro marcadores aparece abaixo do campo de prompt

### Requirement: Um toaster por erro
O formulário SHALL exibir um toaster de erro traduzido para cada código de `errors` devolvido pelo backend.

#### Scenario: Erros de validação
- **WHEN** o backend responde 422 com vários códigos
- **THEN** um toaster é exibido para cada código

### Requirement: Exclusão com confirmação
A ação de excluir SHALL pedir confirmação antes de remover o tipo e, ao concluir, atualizar a tabela.

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma a exclusão
- **THEN** o tipo é removido e a tabela é recarregada sem ele

#### Scenario: Cancelar exclusão
- **WHEN** o usuário cancela a confirmação
- **THEN** nada é excluído

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
