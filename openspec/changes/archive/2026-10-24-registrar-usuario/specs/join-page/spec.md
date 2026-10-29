# Spec Delta

## Purpose

Define a tela pública `/join`, onde a pessoa alterna entre cadastrar-se e entrar, recebendo feedback claro do resultado do cadastro.

## ADDED Requirements

### Requirement: Alternância entre cadastro e login
A tela `/join` SHALL permitir alternar entre o formulário de cadastro (`name`, `email`, `password`) e o de login (`email`, `password`).

#### Scenario: Trocar de modo
- **WHEN** a pessoa aciona o controle de troca em `/join`
- **THEN** o formulário exibido muda entre cadastro e login

### Requirement: Cadastro integrado ao backend
O formulário de cadastro SHALL enviar `name`, `email` e `password` ao endpoint de registro, exigir os três campos pelo atributo `required` e não realizar outra validação no cliente.

#### Scenario: Cadastro bem-sucedido
- **WHEN** o backend responde 201
- **THEN** um toaster de sucesso é exibido e a tela permanece em `/join`

### Requirement: Um toaster por erro
O formulário de cadastro SHALL exibir um toaster de erro individual, com a mensagem traduzida para o idioma do navegador, para cada código em `errors` da resposta, sem redirecionar.

#### Scenario: E-mail já cadastrado
- **WHEN** o backend responde 409 com o código de e-mail duplicado
- **THEN** um toaster com a mensagem de e-mail duplicado é exibido

#### Scenario: Múltiplos erros
- **WHEN** o backend responde com vários códigos em `errors`
- **THEN** um toaster é exibido para cada código

### Requirement: Mensagens traduzidas
Todos os códigos de erro que `POST /auth/register` pode retornar SHALL ter mensagem em português e em inglês.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro do registro é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português

### Requirement: Login apenas visual
O formulário de login SHALL exibir `email`, `password` e botão de envio, sem chamar o backend.

#### Scenario: Envio do login
- **WHEN** a pessoa submete o formulário de login
- **THEN** é exibido um toaster informativo "Login em breve" e nenhuma requisição é feita
