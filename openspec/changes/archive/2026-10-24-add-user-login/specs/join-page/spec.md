# Spec Delta

## ADDED Requirements

### Requirement: Login integrado ao backend
O formulário de login SHALL enviar `email` e `password` ao endpoint de login; em sucesso, iniciar a sessão e levar o usuário à área administrativa (`/example/dashboard`); em erro, exibir um toaster traduzido para cada código em `errors`.

#### Scenario: Login bem-sucedido
- **WHEN** o backend responde 200 ao login
- **THEN** a sessão é iniciada e o usuário é redirecionado para `/example/dashboard`

#### Scenario: Senha incorreta
- **WHEN** o backend responde 401 com `user.credentials.invalid`
- **THEN** um toaster "E-mail ou senha inválidos." (ou "Invalid email or password." em navegador em inglês) é exibido e nenhum cookie é gravado

### Requirement: Redirecionamento com sessão ativa
A tela `/join` SHALL redirecionar para `/example/dashboard` quando há sessão ativa e SHALL NOT exibir o formulário enquanto a sessão é restaurada.

#### Scenario: Acessar /join logado
- **WHEN** um usuário autenticado acessa `/join`
- **THEN** é redirecionado para `/example/dashboard`

## MODIFIED Requirements

### Requirement: Mensagens traduzidas
Todos os códigos de erro que `POST /auth/register` e `POST /auth/login` podem retornar SHALL ter mensagem em português e em inglês.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de registro ou login é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português

## REMOVED Requirements

### Requirement: Login apenas visual
**Reason**: O login passa a autenticar no backend (ver "Login integrado ao backend").
**Migration**: Usar o formulário de login integrado; o toaster "Login em breve" deixa de existir.
