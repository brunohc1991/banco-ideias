# Proposal

## Why

Os formulários de Tipo de Ideia e de Ideia pedem textos longos (descrição, prompt especializado, objetivo) que são trabalhosos de escrever do zero. Uma ajuda de IA no próprio campo, que gera um rascunho a partir do contexto do formulário ou refina o que a pessoa já escreveu, reduz esse atrito e prepara a base de IA que o processamento de Ideias vai usar depois.

## What Changes

- Novo módulo de infraestrutura de IA no backend, com um provedor abstrato de geração de texto e uma implementação sobre a Anthropic (Claude), sem conhecer Ideia nem Tipo de Ideia.
- Novo endpoint autenticado `POST /ai/generate`, genérico: recebe um prompt orientativo e, opcionalmente, contexto e instrução, e devolve `{ text }`.
- Configuração por variáveis de ambiente (`ANTHROPIC_API_KEY` e `ANTHROPIC_MODEL`, padrão `claude-haiku-5-5`), sem chave real no repositório.
- Componente compartilhado de campo com IA no front-end, em linha única ou várias linhas, com botão embutido para gerar do zero ou refinar o conteúdo atual, instrução opcional e campos de contexto.
- Os campos de texto livre dos formulários de Tipo de Ideia (`description`, `prompt`) e de Ideia (`description`, `objective`) passam a usar esse componente, com prompts orientativos fixos.
- Mensagens de erro de IA em português e inglês.
- Fora de escopo: transcrição de voz, processamento de Ideias, cache ou histórico de gerações e limite de uso no backend.

## Capabilities

### New Capabilities
- `ai-text-generation`: geração e refinamento de texto por IA exposta como endpoint autenticado genérico, com validação de entrada e tratamento padronizado de falhas do provedor.
- `ai-text-field`: campo de texto com IA no front-end (gerar, refinar, contexto e instrução) e seu uso nos formulários de Tipo de Ideia e de Ideia.

### Modified Capabilities
<!-- Nenhuma: o uso nos formulários é descrito em `ai-text-field`, porque a capability das telas de Ideia ainda será criada pela change `add-ideas`. -->

## Impact

- `apps/backend`: novo módulo `ai` (provedor, controller, testes e `ai.integration.http`), dependência `@anthropic-ai/sdk`, variáveis em `.env` e `.env.example`, registro no `AppModule`.
- `apps/frontend`: novo componente em `shared/components/ui`, wrapper de API em `shared/api`, i18n pt/en e os dois formulários.
- `openspec/memory/contexto-tecnico.md`: nota sobre onde o prompt é composto.
- Sem mudança de banco nem nos módulos de domínio.
- Depende de `add-idea-types` e `add-default-idea-types` (arquivadas) e de `add-ideas` (ainda não aplicada), cujo formulário de Ideia este change altera.
- Origem do requisito: `.docs/008-modulo-de-ia-texto/spec.md`.
