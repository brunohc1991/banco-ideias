# Proposal

## Why

Escrever textos longos nos formulários é lento, e ditar é mais natural para quem está capturando uma ideia. Um canal de voz, independente da geração de texto por IA, deixa a pessoa falar e ter a fala transcrita direto no campo.

## What Changes

- Novo endpoint autenticado `POST /ai/transcribe`, genérico: recebe um arquivo de áudio e devolve `{ text }`, com validação de presença, tipo e tamanho.
- Falhas do provedor e áudio sem fala tratados de forma padronizada, sem expor a mensagem do provedor.
- Modelo de transcrição configurável por `OPENAI_TRANSCRIPTION_MODEL` (padrão `whisper-1`), reaproveitando a mesma chave da geração de texto.
- O campo de texto com IA ganha um botão de microfone: grava pelo navegador, mostra a gravação dentro do campo (sem vermelho), permite cancelar ou confirmar, e **anexa** a transcrição ao fim do conteúdo, sem nunca substituí-lo.
- A geração e o refinamento de texto continuam como estão, e os dois canais não se misturam.
- Mensagens de erro e de feedback em português e inglês.
- Fora de escopo: limite de duração da gravação, transcrição em tempo real, histórico de áudios e novos formatos de saída.

## Capabilities

### New Capabilities
- `ai-audio-transcription`: transcrição de áudio em texto exposta como endpoint autenticado genérico, com validação do upload e tratamento padronizado de falhas.
- `ai-voice-input`: ditado por voz no campo de texto com IA (gravar, cancelar, confirmar, transcrever e anexar ao conteúdo).

### Modified Capabilities
<!-- Nenhuma: as capabilities de IA (`ai-text-generation` e `ai-text-field`) ainda serão criadas pela change `add-ai-text-generation`; por isso o novo comportamento é descrito em capabilities próprias. -->

## Impact

- `apps/backend`: extensão do módulo `ai` (provedor, controller, testes e `ai.integration.http`), variável `OPENAI_TRANSCRIPTION_MODEL` em `.env` e `.env.example`.
- `apps/frontend`: wrapper de API, componente de campo com IA e i18n pt/en.
- `openspec/memory/contexto-tecnico.md`: nota sobre o resultado anexado.
- Sem mudança de banco nem nos módulos de domínio.
- Depende da change `add-ai-text-generation` (ainda não aplicada), cujo módulo de IA e componente esta change estende.
- Origem do requisito: `.docs/010-modulo-de-ia-voz/spec.md`.
