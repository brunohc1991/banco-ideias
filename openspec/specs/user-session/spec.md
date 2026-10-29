# user-session Specification

## Purpose
Mantém a sessão do usuário autenticado no front-end, persistida entre visitas, e protege as rotas privadas contra acesso sem login.

## Requirements

### Requirement: Sessão persistida em cookie
Após o login, o front-end SHALL gravar o token no cookie `auth_token` com validade de 7 dias, `sameSite` `lax`, `secure` em produção e sem `httpOnly`.

#### Scenario: Login bem-sucedido
- **WHEN** o login é concluído com sucesso
- **THEN** o cookie `auth_token` passa a existir com o token recebido

#### Scenario: Reabrir o navegador
- **WHEN** o navegador é fechado e reaberto dentro da validade do cookie
- **THEN** o usuário continua autenticado

### Requirement: Reidratação da sessão
Ao carregar a aplicação, o front-end SHALL restaurar a sessão a partir do cookie e expor o estado `loading`, `authenticated` ou `unauthenticated`, além dos dados do usuário.

#### Scenario: Recarregar a página logado
- **WHEN** a página é recarregada com cookie válido
- **THEN** o usuário permanece autenticado sem exibir tela pública

#### Scenario: Cookie ausente ou inválido
- **WHEN** o cookie não existe ou seu conteúdo não é um token decodificável
- **THEN** o estado resultante é `unauthenticated`

### Requirement: Acentuação preservada nos dados do usuário
Os dados do usuário lidos do token SHALL preservar caracteres acentuados.

#### Scenario: Nome com acento
- **WHEN** o token contém o nome `José da Conceição`
- **THEN** o nome exibido é exatamente `José da Conceição`

### Requirement: Proteção das rotas privadas
O front-end SHALL impedir o acesso às rotas privadas sem sessão, redirecionando para `/join`, e SHALL NOT exibir conteúdo privado nem tela pública enquanto a sessão é restaurada.

#### Scenario: Acesso deslogado
- **WHEN** um usuário sem sessão acessa uma rota privada
- **THEN** é redirecionado para `/join`

#### Scenario: Sessão em restauração
- **WHEN** a sessão ainda está sendo restaurada
- **THEN** nenhum conteúdo privado é exibido

### Requirement: Logout
O sistema SHALL permitir encerrar a sessão pelo menu do usuário, removendo o cookie `auth_token` e redirecionando para `/join`.

#### Scenario: Logout pelo dropdown
- **WHEN** o usuário aciona "Logout"
- **THEN** o cookie é removido e o usuário é levado a `/join`
