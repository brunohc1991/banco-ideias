# Spec Delta

## Purpose

Permite que um usuário cadastrado se autentique com e-mail e senha e receba um token de acesso e seus dados públicos, sem revelar quais e-mails existem.

## ADDED Requirements

### Requirement: Login por e-mail e senha
O sistema SHALL expor um endpoint público `POST /auth/login` que recebe `email` e `password` e, com credenciais corretas, responde 200 com `{ token, user: { id, name, email } }`.

#### Scenario: Credenciais válidas
- **WHEN** um cliente sem token envia o e-mail e a senha de um usuário cadastrado
- **THEN** a resposta é 200 com `token` e `user` contendo `id`, `name` e `email`

### Requirement: Dados do usuário sem informação sensível
O sistema SHALL NOT devolver senha nem hash de senha na resposta de login, nem incluí-los no token.

#### Scenario: Resposta de login
- **WHEN** o login é concluído com sucesso
- **THEN** nem o corpo da resposta nem o payload do token contêm senha ou hash

### Requirement: Conteúdo e validade do token
O token SHALL conter apenas o identificador (`sub`), `name` e `email` do usuário, ser assinado com `JWT_SECRET` e expirar segundo `JWT_EXPIRES_IN` (padrão de 7 dias).

#### Scenario: Token aceito em rota protegida
- **WHEN** o token recebido no login é enviado a um endpoint protegido
- **THEN** a requisição é autenticada

### Requirement: Credenciais inválidas com erro único
O sistema SHALL responder 401 com o código `user.credentials.invalid` tanto para e-mail inexistente quanto para senha incorreta, sem diferenciar os casos.

#### Scenario: E-mail inexistente
- **WHEN** o login é enviado com um e-mail não cadastrado
- **THEN** a resposta é 401 no formato `ApiErrorResponse` com o código `user.credentials.invalid`

#### Scenario: Senha incorreta
- **WHEN** o login é enviado com e-mail cadastrado e senha errada
- **THEN** a resposta é 401 com o mesmo código `user.credentials.invalid`

### Requirement: Validação dos dados de login
O sistema SHALL rejeitar com 422 um login com `email` ausente ou em formato inválido, ou com `password` ausente.

#### Scenario: E-mail inválido
- **WHEN** o login é enviado com um e-mail em formato inválido
- **THEN** a resposta é 422 no formato `ApiErrorResponse`

#### Scenario: Corpo incompleto
- **WHEN** o login é enviado sem `email` ou sem `password`
- **THEN** a resposta é 422 com um código em `errors` para cada campo inválido

### Requirement: Domínio independente de token
A regra de login no módulo de negócio SHALL devolver apenas `id`, `name` e `email` e SHALL NOT conhecer token, JWT ou sessão; a geração do token ocorre somente na camada HTTP.

#### Scenario: Saída da regra de login
- **WHEN** a regra de login é executada com credenciais válidas
- **THEN** o resultado contém exclusivamente `id`, `name` e `email`
