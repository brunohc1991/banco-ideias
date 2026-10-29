# Módulo: Ideias

## Para que serve

É o coração do produto. Cobre todo o caminho de valor: o usuário captura uma ideia,
organiza-a por um tipo que carrega instruções especializadas para a IA, transforma a
ideia em conteúdo pronto, refina esse conteúdo quantas vezes precisar e acompanha o todo
por um painel de entrada. A narrativa é "capture ideias, processe com IA, reaproveite
quantas vezes precisar".

O módulo reúne quatro áreas de negócio que trabalham juntas: **Tipos de Ideia**,
**Ideias**, **Processamentos** e **Dashboard**. Tudo pertence a um usuário, e cada pessoa
só enxerga e altera os próprios dados.

## Tipos de Ideia

Categoria reutilizável que carrega um **prompt especializado**: o texto que orienta a IA
sobre como tratar a ideia. O prompt usa os marcadores `{{name}}`, `{{description}}`,
`{{objective}}` e `{{resources}}`, preenchidos automaticamente com os dados da ideia no
momento do processamento.

Regras de negócio relevantes:

- O usuário pode escrever os próprios tipos do zero. Nome de 3 a 120 caracteres, descrição
  de 10 a 500 e prompt de 20 a 8000.
- Existe uma **biblioteca de 4 tipos pré-definidos** (roteiro para rede social, roteiro
  viral, VSL e resumo de conteúdo) que pode ser importada de uma vez.
- Essa importação só fica disponível **enquanto o usuário não tem nenhum tipo cadastrado**.
  Quem já tem tipos recebe `0` carregados, sem erro. Como a contagem ignora tipos
  excluídos, quem apaga todos volta a poder importar a biblioteca (decisão deliberada).
- Excluir um tipo é lógico: o registro some das listas e das contagens.

## Ideias

O registro da ideia em si: um cabeçalho com o que é a ideia, sua descrição e o objetivo,
vinculado a um Tipo de Ideia. A ideia **não guarda o resultado** gerado: ela é a matéria
-prima do processamento.

Regras de negócio relevantes:

- Nome de 3 a 120 caracteres, descrição de 10 a 2000 e objetivo de 10 a 1000.
- Toda ideia precisa estar vinculada a um Tipo de Ideia válido e pertencente ao mesmo
  usuário. Alterar a ideia de outro usuário é recusado (403); consultá-la responde como se
  não existisse (404).
- Uma ideia pode reunir **recursos de contexto**: material de apoio que enriquece o que a
  IA recebe. Hoje o recurso é sempre texto; o conceito já prevê outros formatos no futuro
  (imagem, documento, áudio, vídeo). Os recursos fazem parte da ideia, não são um cadastro
  independente.
- **Recurso** é uma entidade interna do agregado `idea`, sem repositório, caso de uso ou
  endpoint próprios. Tem os campos planos `type`, `content` e `position`; novos tipos
  estendem a união de tipos sem mudar essa estrutura. Limites: até 20 recursos por ideia,
  conteúdo de 1 a 20000 caracteres e ids sem repetição.
- Os recursos são gravados, atualizados e excluídos **junto com a ideia**. Ao salvar, a
  lista enviada substitui a anterior (quem a omite fica sem recursos). A ordem definida
  pela pessoa é a ordem salva, e a listagem de ideias não traz os recursos.
- Excluir uma ideia é lógico. Uma ideia **que tenha Processamentos não pode ser excluída**
  (409 `idea.has_processings`): é preciso excluir os Processamentos antes.

## Processamentos

O ato de transformar a ideia em conteúdo com IA. Cada Processamento tira um **retrato
congelado** (snapshot) da ideia, dos recursos e do prompt do tipo no instante em que é
criado, e gera o primeiro resultado. É um agregado próprio, separado da ideia.

Regras de negócio relevantes:

- **O snapshot não muda**: editar a ideia ou o tipo depois **não afeta** processamentos
  já criados. Ele guarda nome, descrição e objetivo da ideia, id e nome do tipo, prompt do
  tipo e os recursos. Isso garante que resultados antigos permaneçam fiéis ao que foi
  gerado.
- A mesma ideia pode originar **vários processamentos independentes**. Só se processa uma
  ideia própria, com tipo existente; caso contrário, é recusado (`processing.idea.invalid`).
- Cada Processamento mantém uma trilha de **iterações**: refinamentos sucessivos, onde
  cada novo pedido de ajuste se soma ao histórico em vez de substituí-lo. A iteração é
  uma entidade interna, sem repositório nem endpoint próprios. O limite é de **50
  iterações**, e o pedido de refinamento tem de 3 a 2000 caracteres.
- O prompt é composto no backend em duas fases. A primeira geração usa o prompt do tipo
  com os quatro marcadores resolvidos em uma única passada (marcador desconhecido fica
  literal; `{{resources}}` vira uma lista numerada). Cada refinamento reenvia o mesmo
  prompt mais o histórico das iterações e o novo pedido.
- Se a IA falhar, **nada é salvo**: na primeira geração não fica processamento "pela
  metade", e num refinamento o histórico permanece exatamente como estava.
- O acesso é restrito ao dono e qualquer acesso indevido responde 404 (nunca 403).
- Excluir um Processamento apaga também as iterações e o snapshot de recursos.
- A atividade em um Processamento (nova iteração) atualiza a data de modificação dele, que
  ordena a listagem.

## Dashboard

A tela de entrada da área privada, **somente leitura**. Dá ao usuário uma visão rápida da
própria atividade: quantas ideias, tipos e processamentos existem, as últimas ideias
atualizadas (5 por padrão, até 20), um gráfico dos últimos 7 dias (Processamentos
executados e Ideias criadas, por dia em UTC) e atalhos para as ações comuns. Registros
excluídos não contam. Não cria nem altera nada: apenas resume o que já existe nas outras
áreas.

## Fronteiras

A Inteligência Artificial é **detalhe de infraestrutura**, não conceito de negócio deste
módulo. O módulo depende de um contrato abstrato de IA e nunca de um provedor específico,
o que permite trocar a tecnologia por baixo sem mexer nas regras de negócio. Não fazem
parte do módulo: streaming de respostas, edição de um Processamento, exclusão de uma
iteração isolada e cache de gerações.
