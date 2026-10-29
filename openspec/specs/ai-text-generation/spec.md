# ai-text-generation Specification

## Purpose

Oferece geração e refinamento de texto por IA como capacidade genérica e autenticada, sem acoplamento aos conceitos de Ideia ou Tipo de Ideia.

## Requirements

### Requirement: Gerar texto
O sistema SHALL expor o endpoint autenticado `POST /ai/generate`, que recebe `prompt` e, opcionalmente, `context` e `instruction`, e responde 200 com `{ text }`, o texto gerado.

#### Scenario: Geração apenas com prompt
- **WHEN** um usuário autenticado envia somente um `prompt` válido
- **THEN** a resposta é 200 com `text` não vazio

#### Scenario: Geração com contexto e instrução
- **WHEN** o usuário envia `prompt`, `context` e `instruction`
- **THEN** a resposta é 200 com `text`, produzido levando em conta os três

### Requirement: Prompt orientativo obrigatório
O sistema SHALL exigir `prompt` com 1 a 8000 caracteres e rejeitar com 422 e o código `ai.prompt.invalid` um prompt ausente, vazio ou maior que o limite.

#### Scenario: Prompt ausente
- **WHEN** a requisição é enviada sem `prompt`
- **THEN** a resposta é 422 com `errors` contendo `ai.prompt.invalid`

#### Scenario: Prompt acima do limite
- **WHEN** o `prompt` tem 8001 caracteres
- **THEN** a resposta é 422 com `ai.prompt.invalid`

### Requirement: Limites de contexto e instrução
O sistema SHALL aceitar `context` de até 16000 caracteres e `instruction` de até 2000, rejeitando com 422 e o código `ai.input.too_long` qualquer um que ultrapasse.

#### Scenario: Contexto longo demais
- **WHEN** o `context` tem 16001 caracteres
- **THEN** a resposta é 422 com `ai.input.too_long`

#### Scenario: Instrução longa demais
- **WHEN** a `instruction` tem 2001 caracteres
- **THEN** a resposta é 422 com `ai.input.too_long`

### Requirement: Composição genérica da chamada
O sistema SHALL usar o `prompt` como orientação do modelo e o contexto e a instrução como pedido do usuário, usando um pedido padrão quando nenhum dos dois for informado, sem consultar nem conhecer dados de Ideias.

#### Scenario: Sem contexto nem instrução
- **WHEN** apenas o `prompt` é informado
- **THEN** o modelo recebe o pedido padrão de gerar o conteúdo solicitado

### Requirement: Falha do provedor
O sistema SHALL responder 502 com o código `ai.generate.failed` quando o provedor de IA falhar, e `ai.generate.empty` quando ele não devolver conteúdo, sem expor a mensagem do provedor ao cliente.

#### Scenario: Erro do provedor
- **WHEN** o provedor falha por rede, quota, autenticação ou tempo esgotado
- **THEN** a resposta é 502 com `ai.generate.failed` e a mensagem original só aparece nos registros do servidor

#### Scenario: Resposta vazia
- **WHEN** o provedor responde sem conteúdo
- **THEN** a resposta é 502 com `ai.generate.empty`

### Requirement: Acesso autenticado à geração
O endpoint de geração SHALL exigir usuário autenticado.

#### Scenario: Sem token
- **WHEN** uma requisição sem token chega a `POST /ai/generate`
- **THEN** a resposta é 401 no formato de erro padronizado

### Requirement: Configuração do provedor
O sistema SHALL ler a chave e o modelo do provedor das variáveis `ANTHROPIC_API_KEY` e `ANTHROPIC_MODEL`, usando `claude-haiku-5-5` quando o modelo não for informado, sem armazenar chave real no repositório.

#### Scenario: Modelo padrão
- **WHEN** `ANTHROPIC_MODEL` não está definido
- **THEN** o modelo usado é `claude-haiku-5-5`

### Requirement: Mensagens traduzidas de IA
Os códigos `ai.prompt.invalid`, `ai.input.too_long`, `ai.generate.failed` e `ai.generate.empty` SHALL ter mensagem em português e em inglês no front-end.

#### Scenario: Idioma do navegador
- **WHEN** um código de erro de IA é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
