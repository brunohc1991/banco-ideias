# Design

## Context

A change `add-ai-text-generation` (ainda não aplicada) cria o módulo `ai` do backend (`AiProvider` abstrato, `OpenAiProvider`, `AiController` com `POST /ai/generate`, validação direta no controller e `ai.integration.http`), o componente `AiTextField` e o wrapper `ai.api.ts` com `AiApiError`. Esta change estende esses artefatos sem alterar o comportamento já entregue e deve ser aplicada depois dela. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Segundo canal de IA (voz) reaproveitando o mesmo provedor, cliente e chave.
- Ditado independente da geração de texto, anexando em vez de substituir.

**Non-Goals:**
- Limite de duração, transcrição em tempo real, histórico de áudios e novos formatos de saída.
- Rate limit.

## Decisions

- **Provedor estendido.** `AiProvider` ganha `transcribe(...)` e `OpenAiProvider` o implementa com o mesmo cliente, usando o modelo de `OPENAI_TRANSCRIPTION_MODEL` (padrão `whisper-1`). Texto vazio vira `ai.transcribe.empty` (502) e qualquer falha do SDK vira log mais `ai.transcribe.failed` (502).
- **Upload por multipart no controller.** `POST /ai/transcribe` recebe um arquivo por interceptador de arquivo do Nest (memória), valida na ordem: presença (`ai.audio.required`), tipo `audio/*` (`ai.audio.invalid_type`) e tamanho de até 25 MB (`ai.audio.too_large`), todos 422, sem entidade.
- **Teto do transporte.** O corte de tamanho do upload é aplicado no recebimento para não bufferizar arquivos arbitrariamente grandes, e o erro de tamanho do upload é convertido em `ai.audio.too_large` (422) pelo filtro de erros, para o cliente sempre ver o mesmo código.
- **Nome e tipo do arquivo para o provedor.** O provedor precisa de nome com extensão coerente com o tipo; o backend monta o nome a partir do tipo do áudio quando necessário.
- **Gravação no navegador.** O componente usa a captação de áudio do navegador (gravador de mídia) e um analisador de áudio para a onda sonora reagir ao volume real. O tipo gravado depende do navegador (por exemplo `webm` ou `mp4`); o wrapper envia o `Blob` com nome derivado do tipo.
- **Anexar, nunca substituir.** O texto transcrito é aparado e unido ao conteúdo atual com um único espaço; difere de propósito do canal de geração, que substitui o valor inteiro.
- **Estados excludentes.** Durante gravação, transcrição ou geração por IA o outro canal fica desabilitado, para um não interferir no outro. Ao desmontar, o gravador e as faixas de áudio são encerrados.
- **Mensagens novas do front-end.** Além dos cinco códigos do backend, entram chaves para sucesso ("Áudio transcrito."), navegador sem suporte e permissão negada, pois o documento de origem pede esses avisos sem nomear as chaves.
- **Capabilities próprias.** As specs de IA de texto ainda não existem como specs principais; descrever o novo comportamento em capabilities novas evita conflito de ordem com `add-ai-text-generation`.
- **Memória.** O `contexto-tecnico.md` já registra o endpoint, a variável e o modelo; a tarefa só acrescenta que o resultado é anexado. O arquivo `processamento-ia.md` citado no documento de origem não existe e `.spec/memory/` é, na prática, `openspec/memory/`.

## Risks / Trade-offs

- [Sem limite de duração, gravações longas podem passar de 25 MB e voltar `ai.audio.too_large`] → aceito no MVP; a mensagem orienta a tentar de novo com áudio menor.
- [Nem todo navegador grava no mesmo formato nem permite o microfone fora de conexão segura] → erro curto sem alterar o campo; o desenvolvimento em `localhost` funciona.
- [Sem chave da OpenAI não dá para validar a transcrição real] → testes automatizados com provedor falso; a validação real fica com a chave do usuário.
- [Texto anexado pode estourar o limite de tamanho do campo no formulário] → a validação do formulário rejeita ao salvar, como em qualquer outro texto.
- [Ordem de aplicação] → aplicar depois de `add-ai-text-generation`.

## Open Questions

- Nenhuma que mude os requisitos.
