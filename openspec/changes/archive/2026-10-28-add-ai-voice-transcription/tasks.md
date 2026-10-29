# Tasks

## 1. Transcrição no backend

- [x] 1.1 Estender `AiProvider` com `transcribe` e implementá-lo em `OpenAiProvider` (modelo por `OPENAI_TRANSCRIPTION_MODEL`, padrão `whisper-1`; texto vazio vira `ai.transcribe.empty` 502; falha do SDK registra log e vira `ai.transcribe.failed` 502). Verificar com testes do provedor usando um cliente falso para sucesso, texto vazio e erro.
- [x] 1.2 Adicionar `OPENAI_TRANSCRIPTION_MODEL="whisper-1"` em `apps/backend/.env.example` e `.env`. Verificar com o backend iniciando sem erro.
- [x] 1.3 Expor `POST /ai/transcribe` no `AiController`, autenticado, com upload de arquivo em memória e validação de presença, tipo de áudio e tamanho de até 25 MB (inclusive convertendo o erro de tamanho do upload em `ai.audio.too_large` 422), devolvendo `{ text }`. Verificar com testes do controller usando um provedor falso para 200, `ai.audio.required`, `ai.audio.invalid_type` e `ai.audio.too_large`.
- [ ] 1.4 Estender `ai.integration.http` com áudio válido, sem arquivo (422), arquivo de texto (422) e sem token (401). Verificar executando os cenários que não dependem da chave real e, com a chave real e um áudio curto, o de sucesso, anotando o tempo da chamada.
- [x] 1.5 Adicionar em `messages.pt.ts` e `messages.en.ts` as chaves `ai.audio.required`, `ai.audio.too_large`, `ai.audio.invalid_type`, `ai.transcribe.failed` e `ai.transcribe.empty`, mais as mensagens de sucesso, de navegador sem suporte e de permissão negada. Verificar com `npx tsc --noEmit` limpo no front-end.

## 2. Ditado por voz no front-end

- [x] 2.1 Estender `shared/api/ai.api.ts` com `transcribeAiAudio(token, audioBlob, fileName?)`, enviando o áudio por multipart com o token e devolvendo o texto, com o mesmo `AiApiError`. Verificar com `npx tsc --noEmit` limpo.
- [x] 2.2 Adicionar ao `AiTextField` o botão de microfone e o fluxo de gravação: permissão, faixa azulada sobreposta com microfone pulsante e onda sonora pelo volume real, botões ✕ e ✓, estado de transcrição com campo desabilitado, anexação ao fim com um único espaço, erros por toaster, microfone desabilitado durante geração ou transcrição e liberação ao desmontar, sem alterar nenhum comportamento da geração e do refinamento. Verificar com `npx tsc --noEmit` limpo e o ditado funcionando no navegador.

## 3. Memória e validação integrada

- [x] 3.1 Registrar em `openspec/memory/contexto-tecnico.md` que o resultado da transcrição é sempre anexado ao conteúdo do campo, ao contrário da geração, que substitui. Verificar relendo a seção "Integração com IA".
- [ ] 3.2 Rodar `npx tsc --noEmit` e o build do front-end, o build e os testes do backend e dos módulos, todos sem erros.
- [ ] 3.3 Validar no navegador e registrar evidência: gravar e confirmar com o campo vazio e com conteúdo (anexado com um espaço), várias gravações em sequência, cancelar sem alterar nada, faixa azulada dentro do campo sem mensagem vermelha, microfone desabilitado durante geração, permissão negada com toaster e geração e refinamento funcionando como antes. Com a chave real, registrar o texto transcrito.
