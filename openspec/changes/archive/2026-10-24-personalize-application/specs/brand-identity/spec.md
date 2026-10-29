# Spec Delta

## Purpose

Define a identidade visual e textual da aplicação, "Banco de Ideias", aplicada de forma consistente em todas as telas públicas e privadas.

## ADDED Requirements

### Requirement: Nome oficial da aplicação
A aplicação SHALL se identificar como "Banco de Ideias" no título da aba do navegador e em todos os pontos de marca, sem manter o nome placeholder "Aplicação".

#### Scenario: Título da aba
- **WHEN** qualquer página da aplicação é aberta
- **THEN** o título da aba do navegador é "Banco de Ideias"

### Requirement: Ícone da marca
A marca SHALL usar o ícone de cérebro com circuito (`BrainCircuit`) como símbolo, sem imagens ou SVG novos.

#### Scenario: Símbolo em todas as superfícies
- **WHEN** o logo é exibido em qualquer superfície
- **THEN** o símbolo é o ícone de cérebro com circuito

### Requirement: Logo sincronizado nas superfícies
O logo (símbolo e nome "Banco de Ideias") SHALL estar visível na landing pública, na tela `/join` e no topo da sidebar da área privada.

#### Scenario: Landing e autenticação
- **WHEN** o usuário abre a landing ou `/join`
- **THEN** o símbolo e o nome "Banco de Ideias" são exibidos

#### Scenario: Sidebar expandida
- **WHEN** a sidebar privada está expandida
- **THEN** o topo exibe símbolo e nome, e o logo leva a `/dashboard`

#### Scenario: Sidebar comprimida
- **WHEN** a sidebar privada está comprimida
- **THEN** o topo exibe apenas o símbolo, sem o nome

### Requirement: Hero da landing
O hero da landing pública SHALL comunicar a proposta de um banco de ideias processado por IA: capturar ideias, processar com IA e reaproveitá-las, com chamada para ação coerente.

#### Scenario: Conteúdo do hero
- **WHEN** a landing pública é aberta
- **THEN** o título destaca "Seu banco de ideias potencializado por IA" e o subtítulo explica captura, prompts e reprocessamento por IA
