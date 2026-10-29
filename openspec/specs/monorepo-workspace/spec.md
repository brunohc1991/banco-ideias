# monorepo-workspace Specification

## Purpose

Define a estrutura base do monorepo do projeto, seus aplicativos, portas e configuração de ambiente, servindo de fundação para todos os módulos.

## Requirements

### Requirement: Monorepo com apps de frontend e backend
O sistema SHALL ser organizado como monorepo Turbo sob o namespace npm `@ideias`, com `apps/frontend` e `apps/backend` como workspaces.

#### Scenario: Workspaces sob o namespace
- **WHEN** os workspaces do monorepo são listados
- **THEN** os pacotes dos apps e do pacote compartilhado usam o escopo `@ideias`

### Requirement: Portas padrão dos aplicativos
O frontend SHALL executar na porta 3000 e o backend na porta 4000.

#### Scenario: Subida dos apps
- **WHEN** os apps são iniciados em desenvolvimento
- **THEN** o frontend responde em `http://localhost:3000` e o backend em `http://localhost:4000`

### Requirement: Configuração por variáveis de ambiente
Cada app SHALL fornecer arquivos `.env` e `.env.example`, e o backend SHALL permitir requisições do frontend via CORS.

#### Scenario: Requisição do frontend ao backend
- **WHEN** o frontend, em sua origem configurada, chama o backend
- **THEN** o backend aceita a requisição sem bloqueio de CORS

### Requirement: Ausência de módulos de domínio na base
A base do projeto SHALL NOT incluir módulos de negócio.

#### Scenario: Estrutura inicial
- **WHEN** o projeto base é inspecionado após esta change
- **THEN** não existe nenhum módulo de domínio em `modules/`
