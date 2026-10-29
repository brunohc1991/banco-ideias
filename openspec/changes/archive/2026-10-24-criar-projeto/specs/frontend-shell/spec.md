# Spec Delta

## Purpose

Define a estrutura base do frontend: componentes compartilhados e separação de rotas públicas e privadas com navegação lateral.

## ADDED Requirements

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
O layout privado SHALL exibir uma sidebar de navegação funcional.

#### Scenario: Navegação pela sidebar
- **WHEN** o usuário clica em um item da sidebar
- **THEN** o app navega para a rota correspondente
