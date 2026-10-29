# Spec Delta

## Purpose

Permite criar uma conta de usuário com nome, e-mail e senha, garantindo dados válidos, e-mail único e senha nunca armazenada em texto legível.

## ADDED Requirements

### Requirement: Cadastro de usuário
O sistema SHALL expor um endpoint público `POST /auth/register` que recebe `name`, `email` e `password` e cria o usuário, respondendo 201 sem corpo.

#### Scenario: Cadastro com dados válidos
- **WHEN** um cliente sem token envia `name`, `email` e `password` válidos para `POST /auth/register`
- **THEN** a resposta é 201 sem corpo e o usuário passa a existir

### Requirement: Validação dos dados de cadastro
O sistema SHALL validar `name` (nome de pessoa), `email` (formato de e-mail) e `password` (senha forte) e rejeitar o cadastro inválido com status 422.

#### Scenario: Senha fraca
- **WHEN** o cadastro é enviado com uma senha que não atende às regras
- **THEN** a resposta é 422 no formato `ApiErrorResponse` com o código de senha inválida em `errors`

#### Scenario: Vários campos inválidos
- **WHEN** o cadastro é enviado com mais de um campo inválido
- **THEN** a resposta é 422 e `errors` contém um código para cada problema

### Requirement: E-mail único
O sistema SHALL recusar o cadastro de um e-mail já registrado, com status 409.

#### Scenario: E-mail duplicado
- **WHEN** o cadastro é enviado com um e-mail já cadastrado
- **THEN** a resposta é 409 no formato `ApiErrorResponse` com o código de e-mail duplicado e nenhum novo usuário é criado

### Requirement: Senha armazenada criptografada
O sistema SHALL armazenar apenas o hash da senha e nunca devolvê-la em nenhuma resposta.

#### Scenario: Senha persistida
- **WHEN** um usuário é cadastrado com sucesso
- **THEN** o valor persistido da senha é um hash diferente da senha informada
