# Tasks

## 1. Infraestrutura de IA (backend)

- [x] 1.1 Adicionar a dependência `@anthropic-ai/sdk` em `apps/backend` e as variáveis `ANTHROPIC_API_KEY=""` e `ANTHROPIC_MODEL="claude-haiku-5-5"` em `.env.example` e `.env`, confirmando que `.env` está no `.gitignore`. Verificar com `npm install` sem erros e o backend iniciando sem a chave.
- [x] 1.2 Criar `AiModule` com `AiProvider` (classe abstrata) e `AnthropicProvider` (modelo por `ANTHROPIC_MODEL`, `messages.create` com `system` e `max_tokens`, sem streaming, erros do SDK registrados em log e convertidos em `ai.generate.failed` 502, resposta vazia em `ai.generate.empty` 502), registrado no `AppModule`. Verificar com testes do provedor usando um cliente falso para sucesso, erro e resposta vazia.
- [x] 1.3 Criar `AiController` com `POST /ai/generate` autenticado: validar `prompt`, `context` e `instruction`, compor a mensagem do usuário e devolver `{ text }`. Verificar com testes do controller usando um `AiProvider` falso para 200, `ai.prompt.invalid`, `ai.input.too_long` e a composição da mensagem.
- [x] 1.4 Criar `ai.integration.http` (login, geração só com prompt, com contexto e instrução, sem prompt, prompt de 8001, contexto de 16001 e sem token). Verificar executando os cenários que não dependem da chave real e, com a chave real configurada pelo usuário, os de geração.
- [x] 1.5 Adicionar em `messages.pt.ts` e `messages.en.ts` as chaves `ai.prompt.invalid`, `ai.input.too_long`, `ai.generate.failed` e `ai.generate.empty`. Verificar com `npx tsc --noEmit` limpo no front-end.

## 2. Componente de campo com IA (front-end)

- [x] 2.1 Criar `shared/api/ai.api.ts` com `AiApiError` e `generateAiText(token, { prompt, context?, instruction? })`. Verificar com `npx tsc --noEmit` limpo.
- [x] 2.2 Criar `shared/components/ui/ai-text-field.tsx` com variantes de uma e várias linhas, botão de IA, popover de instrução, modos gerar e refinar, campos de contexto obrigatórios com balão de pendências, estado de carregamento e tratamento de erro conforme as specs. Verificar com `npx tsc --noEmit` limpo e o componente funcionando em um formulário no navegador.

## 3. Formulários

- [x] 3.1 No formulário de Tipo de Ideia, trocar `description` (várias linhas, contexto: nome) e `prompt` (contexto: nome e descrição, mantendo a dica dos marcadores) pelo campo com IA, com os prompts orientativos definidos no documento de origem. Verificar no navegador: botão desabilitado sem nome, geração da descrição e geração e refino do prompt.
- [x] 3.2 No formulário de Ideia (criado pela change `add-ideas`), trocar `description` (contexto: nome e nome do Tipo de Ideia) e `objective` (contexto: nome, descrição e nome do tipo) pelo campo com IA, resolvendo o nome do tipo a partir do tipo selecionado. Verificar no navegador: botões desabilitados até nome e tipo estarem preenchidos, com o balão listando os pendentes.

## 4. Memória e validação integrada

- [x] 4.1 Registrar em `openspec/memory/contexto-tecnico.md` a nota de que `POST /ai/generate` é genérico e que a composição do prompt acontece no front-end, enquanto o processamento futuro monta o prompt no backend e reutiliza o mesmo `AiProvider`. Verificar relendo a seção "Integração com IA".
- [x] 4.2 Rodar `npx tsc --noEmit` e o build do front-end, o build e os testes do backend e dos módulos, todos sem erros.
- [x] 4.3 Validar no navegador e registrar evidência: gerar e refinar nos quatro campos, botão desabilitado com balão de pendências, estado "Gerando...", erro com toaster traduzido (por exemplo, sem chave configurada) e o valor preservado após o erro; com a chave real, o texto gerado.
