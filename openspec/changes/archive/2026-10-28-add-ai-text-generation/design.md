# Design

## Context

O backend tem guard JWT global, filtro global de erros que converte `DomainError` em `ApiErrorResponse` e `@nestjs/config`. O front-end tem os componentes `Input`, `Textarea`, `Popover` e `Tooltip`, o `getMessage` com i18n pt/en e os formulários de Tipo de Ideia (já existente) e de Ideia (criado pela change `add-ideas`, ainda não aplicada). Não há integração com IA. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Endpoint de IA genérico e reutilizável, sem acoplamento a `modules/ideas`.
- Um único componente de campo com IA, sem duplicar lógica nos formulários.

**Non-Goals:**
- Voz, processamento de Ideias, streaming, cache, histórico e limite de uso.
- Porta de IA no domínio: o futuro caso de uso de processamento decidirá como consumir o provedor.

## Decisions

- **Módulo Nest de infraestrutura** `apps/backend/src/modules/ai`, sem agregado em `modules/` e sem usar `config-new-module`. `AiProvider` é uma classe abstrata com `generate({ systemPrompt, userMessage })`, e `AnthropicProvider` a implementa, registrada com `{ provide: AiProvider, useClass: AnthropicProvider }` e exportada, para o futuro processamento reutilizar o mesmo provedor.
- **Controller fino com validação direta** (sem entidade), para não acoplar o módulo de IA a `modules/ideas`: `prompt` 1..8000 (`ai.prompt.invalid`), `context` até 16000 e `instruction` até 2000 (`ai.input.too_long`), ambos 422.
- **Composição da mensagem no controller:** `Contexto:` + contexto, linha em branco, `Instrução adicional do usuário:` + instrução; sem nenhum dos dois, "Gere o conteúdo solicitado.". O prompt orientativo vai como mensagem de sistema. A composição do prompt do campo acontece no front-end, de propósito, para o endpoint ficar genérico; no processamento futuro o prompt será montado no backend.
- **Provedor de texto: Anthropic (Claude).** O documento de origem previa a OpenAI; o provedor foi trocado por decisão posterior. A API exige `max_tokens` (fixo em 4096 no provedor) e recebe o prompt orientativo no campo `system`; o texto é a junção dos blocos de conteúdo do tipo `text`. A transcrição de voz fica fora desta troca e segue na OpenAI, pois a Anthropic não processa áudio.
- **Erros do provedor** viram `DomainError('ai.generate.failed', 502)` e resposta vazia vira `ai.generate.empty` (502); a mensagem original só vai para o `Logger`.
- **Chave ausente não impede o backend de subir.** O documento de origem chama a chave do provedor de obrigatória, mas uma falha na inicialização travaria quem ainda não tem chave. O cliente é criado sem lançar erro e a chamada falha com `ai.generate.failed`. Alternativa descartada: falhar no boot, como o segredo do JWT.
- **Componente `AiTextField`** em `shared/components/ui`, com popover de instrução opcional, rótulo "Gerar" ou "Refinar" conforme haja valor, campos de contexto `{ label, value, required? }` e balão com os pendentes. Quando há valor, o front-end envia o valor atual como contexto principal delimitado por `"""` mais uma instrução automática de refinar preservando a intenção.
- **Wrapper `shared/api/ai.api.ts`** com `generateAiText` e `AiApiError` (lista de códigos), seguindo o padrão dos demais wrappers.
- **Requisitos dos formulários dentro de `ai-text-field`.** A capability das telas de Ideia ainda não existe como spec principal, então não é possível modificá-la; descrever o uso nos dois formulários na capability nova evita conflito de ordem com a change `add-ideas`.
- **Memória do projeto.** O `contexto-tecnico.md` já registra provedor, modelo e variáveis; o documento de origem cita `.spec/memory/`, mas o caminho real é `openspec/memory/`, e `processamento-ia.md` não existe. A atualização se limita a registrar a nota sobre a composição do prompt.

## Risks / Trade-offs

- [Sem rate limit, uso abusivo consome a quota da chave] → aceito nesta entrega; vale o limite próprio da chave.
- [Sem chave real não dá para validar a geração de ponta a ponta] → testes automatizados usam um provedor falso; a verificação com a Anthropic real depende da chave do usuário.
- [Prompt e contexto montados no cliente podem ser adulterados] → o endpoint é genérico e autenticado, sem dados privilegiados; o impacto é só o texto gerado para o próprio usuário.
- [Seletor de tipos do formulário de Ideia mostra só a primeira página de tipos] → herdado de `add-ideas`; o nome do tipo para o contexto vem da mesma lista.
- [Ordem de aplicação] → aplicar depois de `add-ideas`, pois a tarefa do formulário de Ideia depende dele.

## Open Questions

- Confirmar o nome final do arquivo do formulário de Ideia quando `add-ideas` for aplicada; a tarefa usa `idea-form.component.tsx`.
