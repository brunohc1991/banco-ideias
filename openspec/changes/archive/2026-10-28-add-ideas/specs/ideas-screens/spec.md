# Spec Delta

## Purpose

Define as telas privadas em que o usuário lista, cria, edita e exclui as próprias Ideias.

## ADDED Requirements

### Requirement: Listagem de Ideias
A rota privada `/ideas` SHALL exibir uma tabela paginada com **Nome**, **Tipo de Ideia** (nome do tipo vinculado), **Atualizado em** e ações de editar e excluir, mostrando apenas as Ideias do usuário logado.

#### Scenario: Usuário com ideias
- **WHEN** o usuário abre `/ideas` e possui ideias cadastradas
- **THEN** a tabela exibe nome, nome do Tipo de Ideia, data de atualização e as ações

#### Scenario: Mudar de página
- **WHEN** o usuário troca de página na paginação
- **THEN** a tabela mostra as ideias da página escolhida

### Requirement: Estado vazio das Ideias
Quando o usuário não tem nenhuma Ideia, `/ideas` SHALL exibir um estado vazio com o botão "Cadastrar Ideia".

#### Scenario: Sem ideias
- **WHEN** o usuário sem ideias abre `/ideas`
- **THEN** o estado vazio é exibido e o botão leva a `/ideas/new`

### Requirement: Formulário compartilhado de Ideia
Criação em `/ideas/new` e edição em `/ideas/[id]/edit` SHALL usar o mesmo formulário, com seção "Identificação" (`name`), seção "Detalhes" (`description` e `objective`, campos multilinha) e seção "Classificação" (seleção do Tipo de Ideia).

#### Scenario: Criar
- **WHEN** o usuário envia o formulário em `/ideas/new`
- **THEN** a Ideia é criada

#### Scenario: Editar
- **WHEN** o usuário abre `/ideas/[id]/edit`
- **THEN** o formulário vem preenchido, com o tipo atual selecionado, e o envio atualiza a Ideia

### Requirement: Seleção do Tipo de Ideia
O campo de Tipo de Ideia SHALL listar os Tipos de Ideia do usuário pelo nome e, quando ele não tiver nenhum, SHALL exibir a mensagem "Nenhum Tipo de Ideia cadastrado" com acesso a `/idea-types/new`.

#### Scenario: Usuário com tipos
- **WHEN** o formulário é aberto por um usuário com Tipos de Ideia
- **THEN** a seleção lista os tipos pelo nome

#### Scenario: Usuário sem tipos
- **WHEN** o formulário é aberto por um usuário sem Tipos de Ideia
- **THEN** é exibida a mensagem "Nenhum Tipo de Ideia cadastrado" com um acesso a `/idea-types/new`

### Requirement: Um toaster por erro da Ideia
O formulário de Ideia SHALL exibir um toaster de erro traduzido para cada código de `errors` devolvido pelo backend.

#### Scenario: Erros de validação
- **WHEN** o backend responde 422 com vários códigos
- **THEN** um toaster é exibido para cada código

### Requirement: Exclusão de Ideia com confirmação
A ação de excluir SHALL pedir confirmação antes de remover a Ideia e, ao concluir, atualizar a tabela.

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma a exclusão
- **THEN** a Ideia é removida e a tabela é recarregada sem ela

#### Scenario: Cancelar exclusão
- **WHEN** o usuário cancela a confirmação
- **THEN** nada é excluído
