# app-dashboard Specification

## Purpose
Oferece a página inicial da área privada, onde futuramente serão exibidos indicadores e atalhos do banco de ideias.

## Requirements

### Requirement: Rota de Dashboard
A área privada SHALL expor a rota `/dashboard` como página inicial, exibindo o título "Dashboard" e a visão geral do usuário, formada pelos cards de estatísticas, pelo acesso rápido, pelo gráfico de atividade e pela lista das últimas ideias.

#### Scenario: Usuário autenticado abre o dashboard
- **WHEN** um usuário autenticado acessa `/dashboard`
- **THEN** a página exibe o título "Dashboard" e os blocos da visão geral

#### Scenario: Usuário deslogado
- **WHEN** um usuário sem sessão acessa `/dashboard`
- **THEN** é redirecionado para `/join`

### Requirement: Remoção do módulo de exemplo
O sistema SHALL NOT expor rotas do módulo de exemplo, incluindo `/example/dashboard`.

#### Scenario: Rota antiga
- **WHEN** alguém acessa `/example/dashboard`
- **THEN** a página não é encontrada

### Requirement: Cards de estatísticas
O dashboard SHALL exibir três cards: "Ideias cadastradas", "Tipos cadastrados" e "Processamentos executados", com os totais do usuário, cada um com um ícone de tom discreto e o número em destaque neutro, em grade responsiva de uma, duas ou três colunas.

#### Scenario: Totais exibidos
- **WHEN** o resumo é carregado
- **THEN** cada card mostra o total correspondente

#### Scenario: Carregamento
- **WHEN** o resumo ainda está sendo carregado
- **THEN** cada card mostra um indicador de carregamento no lugar do número

### Requirement: Acesso rápido
O dashboard SHALL exibir a faixa "Acesso rápido" com três atalhos, "Nova ideia", "Novo tipo de ideia" e "Novo processamento", que levam às respectivas telas de criação, sem depender do carregamento do resumo.

#### Scenario: Atalhos
- **WHEN** o usuário aciona um atalho
- **THEN** é levado à tela de criação correspondente

#### Scenario: Antes do resumo carregar
- **WHEN** o resumo ainda está carregando
- **THEN** os três atalhos já estão visíveis e utilizáveis

### Requirement: Gráfico de atividade dos últimos 7 dias
O dashboard SHALL exibir o gráfico "Atividade dos últimos 7 dias", com os 7 dias em ordem crescente, barras para Processamentos e linha para Ideias criadas, com rótulos curtos de dia em português.

#### Scenario: Gráfico com dados
- **WHEN** o resumo é carregado com atividade
- **THEN** o gráfico mostra 7 dias, as barras de Processamentos e a linha de Ideias criadas

#### Scenario: Sem atividade
- **WHEN** todos os valores da atividade são zero
- **THEN** o gráfico mostra o estado vazio do componente

#### Scenario: Carregamento do gráfico
- **WHEN** o resumo ainda está sendo carregado
- **THEN** um espaço reservado de mesma altura aparece no lugar do gráfico

### Requirement: Últimas ideias atualizadas
O dashboard SHALL listar as últimas ideias atualizadas, cada uma com nome que leva à edição da Ideia, o tipo em destaque e a data e hora de atualização.

#### Scenario: Lista de ideias
- **WHEN** o usuário tem ideias
- **THEN** até 5 aparecem da mais recente para a mais antiga e o nome leva a `/ideas/[id]/edit`

#### Scenario: Nenhuma ideia
- **WHEN** o usuário não tem nenhuma ideia
- **THEN** é exibido um estado vazio "Você ainda não cadastrou nenhuma ideia." com o botão "Nova Ideia" para `/ideas/new`

#### Scenario: Carregamento da lista
- **WHEN** o resumo ainda está sendo carregado
- **THEN** linhas de carregamento aparecem no lugar da lista

### Requirement: Erro ao carregar o resumo
Se o carregamento do resumo falhar, o dashboard SHALL exibir um toaster de erro traduzido e manter o esqueleto da tela.

#### Scenario: Falha do backend
- **WHEN** a consulta do resumo falha
- **THEN** um toaster de erro é exibido e os blocos permanecem em estado de carregamento
