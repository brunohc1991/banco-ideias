# Spec Delta

## MODIFIED Requirements

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
