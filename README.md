# Banco de Ideias

Aplicação web para **capturar ideias, processá-las com Inteligência Artificial e reaproveitar o resultado quantas vezes for preciso**.

> **Projeto de estudo.** Foi construído como exercício prático de desenvolvimento de software com apoio de IA (agentes de código, skills e fluxo de especificação OpenSpec). Não é um produto pronto para produção.

## O que o projeto faz

- **Tipos de Ideia**: categorias reutilizáveis que carregam um prompt especializado, com marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}`. Dá para criar os próprios ou importar uma biblioteca de 4 tipos pré-definidos.
- **Ideias**: nome, descrição, objetivo e vínculo com um Tipo, além de até 20 **Recursos** de texto como material de contexto.
- **Processamentos**: a IA gera um resultado a partir de um _snapshot_ da Ideia, dos Recursos e do prompt do Tipo. O resultado pode ser refinado em **iterações** sucessivas, e o histórico é mantido. Editar a Ideia depois não altera processamentos antigos.
- **Ditado por voz** nos formulários, com transcrição de áudio.
- **Dashboard** com contagens, atividade dos últimos 7 dias e as últimas ideias atualizadas.
- Autenticação com cadastro e login (JWT). Cada usuário só vê os próprios dados.

## Stack

- **Monorepo** Turborepo com npm workspaces (`apps/*`, `modules/*`, `packages/*`), em TypeScript.
- **Backend**: NestJS 11 (porta 4000), Prisma 7 e PostgreSQL.
- **Frontend**: Next.js 16 / React 19 (porta 3000), Tailwind CSS v4 e Radix UI.
- **IA**: Anthropic (Claude) para geração de texto e OpenAI (Whisper) para transcrição de voz.
- Regras de negócio em pacotes puros (`modules/auth`, `modules/ideas`), seguindo clean architecture.

## Pré-requisitos

- Node.js **>= 24** e npm 10.9.2
- Docker e Docker Compose (para o PostgreSQL)
- Chave de API da Anthropic (geração de texto) e, opcionalmente, da OpenAI (ditado por voz)

## Como configurar e subir

1. **Instale as dependências** na raiz:

   ```sh
   npm install
   ```

2. **Crie os arquivos `.env`** a partir dos exemplos:

   ```sh
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

   Depois preencha as variáveis conforme a seção [Variáveis de ambiente](#variáveis-de-ambiente).

3. **Suba o banco de dados** (PostgreSQL via Docker, porta 5847):

   ```sh
   npm run db:start --workspace=apps/backend
   ```

4. **Gere o client do Prisma e aplique as migrations**:

   ```sh
   cd apps/backend
   npm run prisma:generate
   npm run prisma:migrate:deploy
   cd ../..
   ```

5. **Builde os pacotes compartilhados** (os módulos são consumidos pelo `dist/`):

   ```sh
   npm run build
   ```

6. **Inicie a aplicação** em modo desenvolvimento:

   ```sh
   npm run dev
   ```

   - Frontend: <http://localhost:3000>
   - Backend: <http://localhost:4000>

## Variáveis de ambiente

### Backend (`apps/backend/.env`)

| Variável                     | Descrição                                                                 | Exemplo / padrão                                                                           |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `DB_HOST`                    | Host do PostgreSQL                                                        | `localhost`                                                                                |
| `DB_PORT`                    | Porta do PostgreSQL                                                       | `5847`                                                                                     |
| `DB_USER`                    | Usuário do banco                                                          | `ideias_banco_ideias`                                                                      |
| `DB_PASSWORD`                | Senha do banco                                                            | `docker`                                                                                   |
| `DB_NAME`                    | Nome do banco                                                             | `ideias_banco_ideias_db`                                                                   |
| `DATABASE_URL`               | String de conexão usada pelo Prisma                                       | `postgresql://ideias_banco_ideias:docker@localhost:5847/ideias_banco_ideias_db?schema=public` |
| `PORT`                       | Porta do backend                                                          | `4000`                                                                                     |
| `JWT_SECRET`                 | Segredo de assinatura do JWT (**obrigatório**; troque em produção)        | `dev-secret-change-me`                                                                     |
| `JWT_EXPIRES_IN`             | Expiração do token                                                        | `7d`                                                                                       |
| `ANTHROPIC_API_KEY`          | Chave da Anthropic, usada na geração e refinamento de texto               | _(vazio)_                                                                                  |
| `ANTHROPIC_MODEL`            | Modelo Claude utilizado                                                   | `claude-haiku-5-5`                                                                         |
| `OPENAI_API_KEY`             | Chave da OpenAI, usada só na transcrição de voz                           | _(vazio)_                                                                                  |
| `OPENAI_TRANSCRIPTION_MODEL` | Modelo de transcrição                                                     | `whisper-1`                                                                                |

Sem as chaves de IA o backend sobe normalmente, mas as chamadas de geração e de transcrição falham (erro 502).

### Frontend (`apps/frontend/.env`)

| Variável              | Descrição                 | Exemplo                 |
| --------------------- | ------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API do backend | `http://localhost:4000` |

> Nunca commite chaves reais. Os arquivos `.env` já estão no `.gitignore`.

## Scripts úteis

Na raiz:

| Comando               | O que faz                                       |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Sobe backend e frontend em modo desenvolvimento |
| `npm run build`       | Builda todos os pacotes e apps                  |
| `npm test`            | Roda os testes de `shared`, módulos e backend   |
| `npm run lint`        | Executa o lint                                  |
| `npm run check-types` | Verifica os tipos                               |
| `npm run format`      | Formata o código com Prettier                   |

Em `apps/backend`: `db:start`, `db:stop`, `db:logs`, `prisma:migrate:dev`, `prisma:studio`.

## Estrutura

```
apps/
  backend/    API NestJS (controllers finos, repositórios Prisma, módulo de IA)
  frontend/   Next.js (rotas públicas e privadas)
modules/
  auth/       regras de negócio de autenticação
  ideas/      regras de negócio de tipos, ideias, recursos e processamentos
packages/
  shared/     entidade base, casos de uso, erros e regras de validação
openspec/     memória do projeto, specs e histórico de changes (fluxo OpenSpec)
```

A documentação de produto e de arquitetura está em [openspec/memory/](openspec/memory/), e o comportamento de cada funcionalidade em [openspec/specs/](openspec/specs/).

## Sobre o projeto de estudo

Este repositório nasceu de um estudo sobre como trabalhar com IA no desenvolvimento: o MVP foi entregue em 12 changes especificadas e implementadas com agentes de código, usando o fluxo OpenSpec e skills próprias para gerar módulos, entidades, casos de uso, repositórios e controllers de forma padronizada.

Limitações conhecidas: a transcrição de voz ainda não foi validada com uma chave OpenAI com créditos, e a interface é validada apenas manualmente.
