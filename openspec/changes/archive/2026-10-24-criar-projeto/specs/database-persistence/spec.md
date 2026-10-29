# Spec Delta

## Purpose

Fornece a infraestrutura de persistência com Prisma, organizada por domínio, pronta para receber models de módulos futuros.

## ADDED Requirements

### Requirement: Schema Prisma modular por domínio
O backend SHALL compor o schema Prisma a partir de arquivos por domínio em `prisma/models/*.model.prisma`.

#### Scenario: Geração do client
- **WHEN** o comando de geração do Prisma é executado
- **THEN** o client é gerado a partir de todos os arquivos de model sem erros

### Requirement: Banco local via Docker Compose
O backend SHALL disponibilizar um Docker Compose cujo banco seja compatível com `DATABASE_URL` do `.env`.

#### Scenario: Banco de desenvolvimento
- **WHEN** o Docker Compose do backend é iniciado
- **THEN** o banco fica acessível com a `DATABASE_URL` configurada

### Requirement: Acesso ao banco injetável
O backend SHALL expor um módulo e um serviço de acesso ao banco reutilizáveis por módulos de negócio.

#### Scenario: Registro na aplicação
- **WHEN** a aplicação backend é inicializada
- **THEN** o acesso ao banco está disponível para injeção sem configuração adicional

### Requirement: Seed técnico
O backend SHALL ter um ponto de entrada de seed técnico que não contém dados de módulos.

#### Scenario: Execução do seed
- **WHEN** o seed é executado sem módulos de negócio
- **THEN** ele conclui sem erros e sem inserir dados de domínio
