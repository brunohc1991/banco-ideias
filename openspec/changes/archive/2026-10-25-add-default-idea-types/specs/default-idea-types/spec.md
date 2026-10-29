# Spec Delta

## Purpose

Oferece uma biblioteca inicial de Tipos de Ideia prontos, que o usuário importa de uma vez para a própria lista e usa como ponto de partida e referência de bons prompts.

## ADDED Requirements

### Requirement: Biblioteca de tipos pré-definidos
O sistema SHALL manter uma biblioteca fixa com pelo menos quatro Tipos de Ideia: roteiro de vídeo para rede social, roteiro de vídeo viral, vídeo VSL e resumo de conteúdo, cada um com nome, descrição e prompt.

#### Scenario: Conteúdo da biblioteca
- **WHEN** a biblioteca é consultada
- **THEN** contém os quatro tipos iniciais, cada um com `name`, `description` e `prompt`

### Requirement: Prompts válidos e com marcadores
Cada tipo da biblioteca SHALL respeitar os limites de um Tipo de Ideia (nome de 3 a 120, descrição de 10 a 500 e prompt de 20 a 8000 caracteres) e SHALL usar os marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}` em prompt de várias linhas.

#### Scenario: Limites respeitados
- **WHEN** cada tipo da biblioteca é validado como Tipo de Ideia
- **THEN** nenhum campo viola os limites de tamanho

#### Scenario: Marcadores presentes
- **WHEN** o prompt de um tipo da biblioteca é lido
- **THEN** ele contém os quatro marcadores e mais de uma linha

### Requirement: Carregar tipos padrão
O sistema SHALL expor o endpoint autenticado `POST /idea-types/load-defaults`, que cria para o usuário autenticado um Tipo de Ideia para cada item da biblioteca e responde 200 com `{ loaded }`, a quantidade criada.

#### Scenario: Usuário sem tipos
- **WHEN** um usuário sem nenhum Tipo de Ideia chama `POST /idea-types/load-defaults`
- **THEN** a resposta é 200 com `loaded` igual ao tamanho da biblioteca e os tipos passam a aparecer em `GET /idea-types` como dele

### Requirement: Carregamento idempotente
O sistema SHALL carregar a biblioteca somente quando o usuário não tem nenhum Tipo de Ideia; caso já tenha algum, SHALL responder 200 com `loaded` igual a 0, sem erro e sem criar ou alterar registros.

#### Scenario: Chamada repetida
- **WHEN** o mesmo usuário chama o endpoint duas vezes em sequência
- **THEN** a primeira responde com a quantidade carregada, a segunda responde `loaded` 0 e o total de tipos não muda

#### Scenario: Usuário com tipo próprio
- **WHEN** um usuário que já criou um Tipo de Ideia chama o endpoint
- **THEN** a resposta é 200 com `loaded` 0 e nenhum tipo é adicionado

### Requirement: Carregamento isolado por usuário
O carregamento SHALL considerar e criar apenas os Tipos de Ideia do usuário autenticado.

#### Scenario: Outro usuário já tem tipos
- **WHEN** um usuário sem tipos carrega os padrões enquanto outro usuário já tem tipos
- **THEN** o primeiro recebe a biblioteca e os tipos do outro não são alterados

### Requirement: Acesso autenticado ao carregamento
O endpoint de carregamento SHALL exigir usuário autenticado.

#### Scenario: Sem token
- **WHEN** uma requisição sem token chega a `POST /idea-types/load-defaults`
- **THEN** a resposta é 401 no formato de erro padronizado
