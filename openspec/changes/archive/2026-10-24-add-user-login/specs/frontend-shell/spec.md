# Spec Delta

## ADDED Requirements

### Requirement: Rotas privadas exigem sessão
O layout do grupo `(private)` SHALL exibir seu conteúdo somente a usuários autenticados.

#### Scenario: Usuário autenticado
- **WHEN** um usuário autenticado acessa uma rota privada
- **THEN** a página é exibida normalmente

#### Scenario: Usuário não autenticado
- **WHEN** um usuário sem sessão acessa uma rota privada
- **THEN** é redirecionado para `/join`

### Requirement: Usuário logado no cabeçalho
O cabeçalho do layout privado SHALL exibir o nome e o e-mail do usuário autenticado no menu do usuário.

#### Scenario: Menu do usuário
- **WHEN** o usuário autenticado abre o menu do usuário no cabeçalho
- **THEN** são exibidos seu nome e e-mail, com acentuação correta
