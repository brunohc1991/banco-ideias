# ai-audio-transcription Specification

## Purpose

Converte áudio em texto como capacidade genérica e autenticada, sem acoplamento ao campo ou ao formulário de destino.

## Requirements

### Requirement: Transcrever áudio
O sistema SHALL expor o endpoint autenticado `POST /ai/transcribe`, que recebe um arquivo de áudio enviado como upload e responde 200 com `{ text }`, o texto transcrito.

#### Scenario: Áudio válido
- **WHEN** um usuário autenticado envia um arquivo de áudio válido com fala
- **THEN** a resposta é 200 com `text` não vazio

### Requirement: Áudio obrigatório
O sistema SHALL rejeitar com 422 e o código `ai.audio.required` uma requisição sem arquivo de áudio.

#### Scenario: Sem arquivo
- **WHEN** a requisição é enviada sem arquivo
- **THEN** a resposta é 422 com `errors` contendo `ai.audio.required`

### Requirement: Tipo de arquivo aceito
O sistema SHALL aceitar somente arquivos cujo tipo seja de áudio, rejeitando os demais com 422 e o código `ai.audio.invalid_type`.

#### Scenario: Arquivo de texto
- **WHEN** um arquivo de texto puro é enviado
- **THEN** a resposta é 422 com `ai.audio.invalid_type`

### Requirement: Tamanho máximo do áudio
O sistema SHALL aceitar áudio de até 25 MB, rejeitando com 422 e o código `ai.audio.too_large` um arquivo maior.

#### Scenario: Arquivo acima do limite
- **WHEN** um áudio maior que 25 MB é enviado
- **THEN** a resposta é 422 com `ai.audio.too_large` e nada é enviado ao provedor

### Requirement: Áudio sem fala
O sistema SHALL responder 502 com o código `ai.transcribe.empty` quando o áudio não tiver fala identificável.

#### Scenario: Silêncio
- **WHEN** o áudio enviado não contém fala reconhecível
- **THEN** a resposta é 502 com `ai.transcribe.empty`

### Requirement: Falha do provedor na transcrição
O sistema SHALL responder 502 com o código `ai.transcribe.failed` quando o provedor falhar, sem expor a mensagem do provedor ao cliente.

#### Scenario: Erro do provedor
- **WHEN** o provedor falha por rede, quota, autenticação ou tempo esgotado
- **THEN** a resposta é 502 com `ai.transcribe.failed` e a mensagem original só aparece nos registros do servidor

### Requirement: Acesso autenticado à transcrição
O endpoint de transcrição SHALL exigir usuário autenticado.

#### Scenario: Sem token
- **WHEN** uma requisição sem token chega a `POST /ai/transcribe`
- **THEN** a resposta é 401 no formato de erro padronizado

### Requirement: Configuração do modelo de transcrição
O sistema SHALL ler o modelo de transcrição da variável `OPENAI_TRANSCRIPTION_MODEL`, usando `whisper-1` quando não informada, e a mesma chave de acesso da geração de texto.

#### Scenario: Modelo padrão
- **WHEN** `OPENAI_TRANSCRIPTION_MODEL` não está definida
- **THEN** o modelo usado é `whisper-1`

### Requirement: Mensagens traduzidas da transcrição
Os códigos `ai.audio.required`, `ai.audio.too_large`, `ai.audio.invalid_type`, `ai.transcribe.failed` e `ai.transcribe.empty` SHALL ter mensagem em português e em inglês no front-end.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de transcrição é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
