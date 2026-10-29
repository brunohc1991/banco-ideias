# frontend-shell Specification

## Purpose

Define a estrutura base do frontend: componentes compartilhados e separação de rotas públicas e privadas com navegação lateral.

## Requirements

### Requirement: Estrutura compartilhada do frontend
O frontend SHALL conter uma pasta `shared/` com componentes, navegação e estilos globais reutilizáveis.

#### Scenario: Build do frontend
- **WHEN** o build do frontend é executado
- **THEN** conclui sem erros

### Requirement: Grupos de rotas público e privado
O frontend SHALL separar rotas em grupos `(public)` e `(private)`, cada um com seu layout.

#### Scenario: Rota pública
- **WHEN** o usuário acessa uma rota do grupo público
- **THEN** a página é exibida sem sidebar de navegação

#### Scenario: Rota privada
- **WHEN** o usuário acessa uma rota do grupo privado
- **THEN** a página é exibida com o layout que contém a sidebar de navegação

### Requirement: Sidebar de navegação
O layout privado SHALL exibir uma sidebar de navegação funcional, única e plana (sem seletor de módulos), contendo os itens Dashboard, que leva a `/dashboard`, Tipos de Ideia, que leva a `/idea-types`, Ideias, que leva a `/ideas`, e Processamentos, que leva a `/processings`.

#### Scenario: Navegação pela sidebar
- **WHEN** o usuário clica em um item da sidebar
- **THEN** o app navega para a rota correspondente

#### Scenario: Itens do menu
- **WHEN** a sidebar privada é exibida
- **THEN** os itens são "Dashboard", "Tipos de Ideia", "Ideias" e "Processamentos", nessa ordem, sem rail de módulos

#### Scenario: Item ativo
- **WHEN** o usuário está em `/dashboard` ou em uma rota de `/idea-types`, `/ideas` ou `/processings`
- **THEN** o item correspondente aparece como ativo

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
