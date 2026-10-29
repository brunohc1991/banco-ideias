# Spec Delta

## Purpose

Fornece, numa única consulta, o resumo que alimenta a visão geral do usuário: totais, últimas Ideias e atividade recente.

## ADDED Requirements

### Requirement: Resumo do dashboard
O sistema SHALL expor o endpoint autenticado `GET /dashboard/summary`, que responde 200 com `stats`, `latestIdeas` e `activity` do usuário autenticado.

#### Scenario: Usuário com dados
- **WHEN** um usuário autenticado consulta o resumo
- **THEN** a resposta traz `stats`, `latestIdeas` e `activity`

### Requirement: Estatísticas do usuário
`stats` SHALL conter `ideasCount`, `ideaTypesCount` e `processingsCount`, as quantidades de Ideias, Tipos de Ideia e Processamentos do usuário, sem contar registros excluídos.

#### Scenario: Contagens
- **WHEN** o usuário tem 3 Ideias, 2 Tipos de Ideia e 1 Processamento
- **THEN** `stats` é `{ ideasCount: 3, ideaTypesCount: 2, processingsCount: 1 }`

#### Scenario: Registro excluído
- **WHEN** o usuário exclui uma Ideia
- **THEN** ela deixa de entrar em `ideasCount`

### Requirement: Últimas Ideias atualizadas
`latestIdeas` SHALL listar as Ideias do usuário mais recentemente atualizadas, da mais nova para a mais antiga, cada uma com `id`, `name`, `ideaTypeId`, `ideaTypeName` e `updatedAt` em formato ISO 8601, sem dados completos da Ideia.

#### Scenario: Ordem e quantidade padrão
- **WHEN** o usuário tem 8 Ideias e não informa o limite
- **THEN** `latestIdeas` traz as 5 mais recentemente atualizadas, em ordem decrescente de `updatedAt`

### Requirement: Limite da lista configurável
O sistema SHALL aceitar o parâmetro `latestLimit`, inteiro de 1 a 20, com padrão 5, rejeitando com 422 e o código `dashboard.latestLimit.invalid` qualquer outro valor.

#### Scenario: Limites válidos
- **WHEN** `latestLimit` é 1 ou 20
- **THEN** a resposta é 200 com no máximo esse número de itens

#### Scenario: Limites inválidos
- **WHEN** `latestLimit` é 0, 21, 3.5 ou não numérico
- **THEN** a resposta é 422 com `dashboard.latestLimit.invalid`

### Requirement: Atividade dos últimos 7 dias
`activity` SHALL ter sempre exatamente 7 itens, do dia de seis dias atrás até hoje, em ordem crescente, cada um com `date` (`YYYY-MM-DD`, em UTC), `ideasCreated` e `processingsExecuted`, preenchendo com zero os dias sem registro; a janela é fixa e não aceita parâmetro.

#### Scenario: Dias sem registro
- **WHEN** há registros em apenas 2 dos 7 dias
- **THEN** `activity` traz 7 itens e os outros 5 têm os dois contadores em zero

#### Scenario: Usuário sem dados
- **WHEN** o usuário não tem nenhum registro
- **THEN** `stats` está zerado, `latestIdeas` está vazio e `activity` tem 7 itens zerados

### Requirement: Contagem por dia de criação
`ideasCreated` SHALL contar as Ideias do usuário criadas no dia, e `processingsExecuted` os Processamentos do usuário criados no dia, agrupados pela data de criação em UTC.

#### Scenario: Criações no mesmo dia
- **WHEN** o usuário cria 2 Ideias e 1 Processamento hoje
- **THEN** o último item de `activity` tem `ideasCreated` 2 e `processingsExecuted` 1

### Requirement: Isolamento por usuário
Todas as informações do resumo SHALL considerar apenas os dados do usuário autenticado.

#### Scenario: Dois usuários
- **WHEN** dois usuários têm dados e um deles consulta o resumo
- **THEN** nenhuma contagem, Ideia ou atividade do outro aparece

### Requirement: Acesso autenticado ao resumo
O endpoint do resumo SHALL exigir usuário autenticado.

#### Scenario: Sem token
- **WHEN** uma requisição sem token chega a `GET /dashboard/summary`
- **THEN** a resposta é 401 no formato de erro padronizado

### Requirement: Mensagem traduzida do limite
O código `dashboard.latestLimit.invalid` SHALL ter mensagem em português e em inglês no front-end.

#### Scenario: Idioma do navegador
- **WHEN** o código é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
