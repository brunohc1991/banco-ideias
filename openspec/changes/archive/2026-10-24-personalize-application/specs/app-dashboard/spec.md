# Spec Delta

## Purpose

Oferece a página inicial da área privada, onde futuramente serão exibidos indicadores e atalhos do banco de ideias.

## ADDED Requirements

### Requirement: Rota de Dashboard
A área privada SHALL expor a rota `/dashboard` como página inicial, exibindo o título "Dashboard" e um espaço reservado, sem dados, gráficos ou chamadas de API.

#### Scenario: Usuário autenticado abre o dashboard
- **WHEN** um usuário autenticado acessa `/dashboard`
- **THEN** a página exibe o título "Dashboard" e o espaço reservado

#### Scenario: Usuário deslogado
- **WHEN** um usuário sem sessão acessa `/dashboard`
- **THEN** é redirecionado para `/join`

### Requirement: Remoção do módulo de exemplo
O sistema SHALL NOT expor rotas do módulo de exemplo, incluindo `/example/dashboard`.

#### Scenario: Rota antiga
- **WHEN** alguém acessa `/example/dashboard`
- **THEN** a página não é encontrada
