# Produto — Banco de Ideias

## Em uma frase

O **Banco de Ideias** é uma aplicação web onde o usuário captura ideias, organiza-as por tipo (cada tipo carrega um prompt especializado) e usa Inteligência Artificial para transformar essas ideias em conteúdo pronto — podendo reprocessar e refinar o resultado quantas vezes precisar, mantendo o histórico de cada geração.

Narrativa central do produto: **"capture ideias, processe com IA, reaproveite quantas vezes precisar"**.

## Para quem

Usuário individual e autenticado que produz conteúdo a partir de ideias (ex.: roteiros de vídeo para redes sociais, roteiros virais, VSL, resumos de conteúdo). Cada usuário só enxerga e manipula os próprios dados — toda entidade de negócio pertence a um `userId` e toda consulta filtra por ele.

## Conceitos do domínio

- **Tipo de Ideia** (`idea-type`): categoria reutilizável que carrega um **prompt especializado**. O prompt é um texto livre com marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}`, substituídos pelos dados da Ideia no momento do processamento (marcador desconhecido fica literal). O usuário pode escrever os próprios ou importar uma biblioteca de 4 **Tipos pré-definidos** (carga em massa, idempotente, disponível só enquanto o usuário não tem nenhum Tipo cadastrado).
- **Ideia** (`idea`): cabeçalho com `name`, `description`, `objective` e o vínculo
  (`ideaTypeId`) com um Tipo de Ideia. Não guarda resultado.
- **Recurso** (`Resource`): material de contexto anexado a uma Ideia (relação
  mestre–detalhe, persistido junto da Ideia, sem endpoints próprios). No MVP só o tipo
  `text`; o modelo (`type` + `content` + `position`) já prevê tipos futuros (`image`,
  `document`, `audio`, `video-url`). Máx. 20 por Ideia, com ordem definida pela pessoa.
- **Processamento** (`processing`): agregado próprio que tira um **snapshot** da Ideia +
  Recursos + prompt do Tipo no momento da criação e gera o primeiro Resultado via IA.
  Cada Processamento tem uma trilha de **Iterações** (refinamentos sucessivos, máx. 50),
  cada iteração com `refinement` e `result`. A mesma Ideia pode originar vários
  Processamentos independentes. Editar a Ideia depois **não** afeta Processamentos antigos.
  Excluir um Processamento apaga todas as suas iterações.
- **Dashboard**: visão de entrada da área privada (somente leitura): contagens de Ideias,
  Tipos e Processamentos, acesso rápido às ações comuns, gráfico de atividade dos últimos
  7 dias (Processamentos e Ideias criadas) e lista das 5 últimas Ideias atualizadas.

## Decisões de produto relevantes

- **Snapshot, não referência viva**: Processamento congela os dados da Ideia/Tipo na criação. Garante que resultados antigos não mudem quando a Ideia é editada.
- **Carga de Tipos padrão é gate por "zero registros"**: só é possível importar a
  biblioteca enquanto o usuário não tem nenhum Tipo. Como a contagem ignora Tipos
  excluídos, quem apaga todos volta a poder importar (decisão deliberada).
- **Ideia com Processamentos não pode ser excluída**: é preciso apagar os Processamentos
  antes, para não deixar resultados órfãos.
- **IA é detalhe de infraestrutura**, não conceito de negócio. O domínio depende de uma porta abstrata (`AiProvider`), nunca de um provedor específico. Existem dois canais de IA, independentes entre si: geração/refinamento de texto (Anthropic) e transcrição de voz para ditado (OpenAI, porque a Anthropic não transcreve áudio). O texto ditado é sempre **anexado** ao campo; o gerado o **substitui**.
- O conteúdo gerado pela IA é renderizado como **Markdown** na timeline do Processamento.

## Estado atual

MVP funcional ponta a ponta, entregue por 12 changes, todas arquivadas em
`openspec/changes/archive/`: base do projeto, registro e login, identidade visual, CRUD de
Tipo de Ideia e carga de padrões, CRUD de Ideia, módulo de IA (texto), Recursos, ditado por
voz, Processamento com iterações e Dashboard. Não há changes ativas em
`openspec/changes/`. O comportamento atual está nas specs principais em `openspec/specs/`.
Pendências conhecidas: a transcrição de voz ainda não foi validada com uma chave OpenAI
com créditos, e a interface só é validada manualmente.

## Fora de escopo (evolução futura, registrada nas specs)

Streaming de respostas da IA, full-text search (`tsvector`) na busca de Ideias, exclusão ou edição de iteração isolada, edição do Processamento, cache de gerações, limite de duração da gravação de voz, ajuste de fuso horário no gráfico do dashboard, novos tipos de Recurso além de texto e reordenação de Recursos por arrastar (hoje é por botões).
