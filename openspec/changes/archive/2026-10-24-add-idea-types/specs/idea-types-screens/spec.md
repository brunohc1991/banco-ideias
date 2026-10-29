# Spec Delta

## Purpose

Define as telas privadas em que o usuário lista, cria, edita e exclui os próprios Tipos de Ideia.

## ADDED Requirements

### Requirement: Listagem de Tipos de Ideia
A rota privada `/idea-types` SHALL exibir uma tabela paginada com **Nome**, **Descrição** (truncada), **Atualizado em** e ações de editar e excluir, mostrando apenas os tipos do usuário logado.

#### Scenario: Usuário com tipos
- **WHEN** o usuário abre `/idea-types` e possui tipos cadastrados
- **THEN** a tabela exibe nome, descrição truncada, data de atualização e as ações

#### Scenario: Mudar de página
- **WHEN** o usuário troca de página na paginação
- **THEN** a tabela mostra os tipos da página escolhida

### Requirement: Estado vazio
Quando o usuário não tem nenhum Tipo de Ideia, `/idea-types` SHALL exibir um estado vazio com o botão "Cadastrar Tipo de Ideia".

#### Scenario: Sem tipos
- **WHEN** o usuário sem tipos abre `/idea-types`
- **THEN** o estado vazio é exibido e o botão leva a `/idea-types/new`

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
