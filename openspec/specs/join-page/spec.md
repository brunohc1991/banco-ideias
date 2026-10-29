# join-page Specification

## Purpose

Define a tela pública `/join`, onde a pessoa alterna entre cadastrar-se e entrar, recebendo feedback claro do resultado do cadastro.

## Requirements

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
Todos os códigos de erro que `POST /auth/register` e `POST /auth/login` podem retornar SHALL ter mensagem em português e em inglês.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de registro ou login é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português

### Requirement: Login integrado ao backend
O formulário de login SHALL enviar `email` e `password` ao endpoint de login; em sucesso, iniciar a sessão e levar o usuário à área administrativa (`/dashboard`); em erro, exibir um toaster traduzido para cada código em `errors`.

#### Scenario: Login bem-sucedido
- **WHEN** o backend responde 200 ao login
- **THEN** a sessão é iniciada e o usuário é redirecionado para `/dashboard`

#### Scenario: Senha incorreta
- **WHEN** o backend responde 401 com `user.credentials.invalid`
- **THEN** um toaster "E-mail ou senha inválidos." (ou "Invalid email or password." em navegador em inglês) é exibido e nenhum cookie é gravado

### Requirement: Redirecionamento com sessão ativa
A tela `/join` SHALL redirecionar para `/dashboard` quando há sessão ativa e SHALL NOT exibir o formulário enquanto a sessão é restaurada.

#### Scenario: Acessar /join logado
- **WHEN** um usuário autenticado acessa `/join`
- **THEN** é redirecionado para `/dashboard`
