# Módulo: Ideias

## Para que serve

É o coração do produto. Cobre todo o caminho de valor: o usuário captura uma ideia,
organiza-a por um tipo que carrega instruções especializadas para a IA, transforma a
ideia em conteúdo pronto, refina esse conteúdo quantas vezes precisar e acompanha o todo
por um painel de entrada. A narrativa é "capture ideias, processe com IA, reaproveite
quantas vezes precisar".

O módulo reúne quatro áreas de negócio que trabalham juntas: **Tipos de Ideia**,
**Ideias**, **Processamentos** e **Dashboard**.

## Tipos de Ideia

Categoria reutilizável que carrega um **prompt especializado** — o texto que orienta a IA
sobre como tratar a ideia. O prompt usa marcadores que são preenchidos automaticamente com
os dados da ideia no momento do processamento.

Regras de negócio relevantes:

- O usuário pode escrever os próprios tipos do zero.
- Existe uma **biblioteca de tipos pré-definidos** (ex.: roteiro para rede social, roteiro
  viral, VSL, resumo de conteúdo) que pode ser importada de uma vez.
- Essa importação só fica disponível **enquanto o usuário ainda não tem nenhum tipo
  cadastrado**. Quem já personalizou a própria biblioteca não recebe a carga automática de
  novo, mesmo que apague tudo depois.
- Um usuário só enxerga e altera os próprios tipos.

## Ideias

O registro da ideia em si: um cabeçalho com o que é a ideia, sua descrição e o objetivo,
vinculado a um Tipo de Ideia. A ideia **não guarda o resultado** gerado — ela é a matéria
-prima do processamento.

Regras de negócio relevantes:

- Toda ideia precisa estar vinculada a um Tipo de Ideia válido e pertencente ao mesmo usuário.
- Uma ideia pode reunir **recursos de contexto** — material de apoio que enriquece o que a
  IA recebe. Hoje o recurso é sempre texto; o conceito já prevê outros formatos no futuro
  (imagem, documento, áudio, vídeo). Os recursos fazem parte da ideia, não são um cadastro
  independente.
- **Recurso** é uma entidade interna do agregado `idea`, sem repositório, caso de uso ou
  endpoint próprios: é gravado, atualizado (por substituição da lista inteira) e excluído
  junto com a ideia. Tem os campos planos `type`, `content` e `position`; hoje só existe o
  tipo `text`, e novos tipos estendem a união de tipos sem mudar essa estrutura. Limites:
  até 20 recursos por ideia e conteúdo de 1 a 20000 caracteres.

## Processamentos

O ato de transformar a ideia em conteúdo com IA. Cada Processamento tira um **retrato
congelado** (snapshot) da ideia, dos recursos e do prompt do tipo no instante em que é
criado, e gera o primeiro resultado.

Regras de negócio relevantes:

- **O snapshot não muda**: editar a ideia ou o tipo depois **não afeta** processamentos
  já criados. Isso garante que resultados antigos permaneçam fiéis ao que foi gerado.
- A mesma ideia pode originar **vários processamentos independentes**.
- Cada Processamento mantém uma trilha de **iterações** — refinamentos sucessivos, onde
  cada novo pedido de ajuste se soma ao histórico em vez de substituí-lo.
- Há um limite de iterações por processamento, para manter o histórico saudável.
- Se a IA falhar na primeira geração, nada é salvo — não fica processamento "pela metade".
- **Processamento** é um agregado próprio (`processing`), separado da Ideia: guarda o snapshot
  (nome, descrição e objetivo da ideia, id e nome do tipo, prompt do tipo e recursos) e as
  **iterações** como entidade interna, sem repositório nem endpoint próprios. Até 50
  iterações; o refinamento tem de 3 a 2000 caracteres.
- O prompt é composto no backend em duas fases: a primeira geração usa o prompt do tipo com
  `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}` resolvidos em uma única
  passada (marcador desconhecido fica literal); os refinamentos reenviam o mesmo prompt mais
  o histórico das iterações e o novo pedido. Se a IA falhar, nada é salvo.
- O acesso é restrito ao dono e qualquer acesso indevido responde 404 (nunca 403).
- **Uma Ideia com Processamentos não pode ser excluída** (409 `idea.has_processings`): é
  preciso excluir os Processamentos antes.

## Dashboard

A tela de entrada da área privada, **somente leitura**. Dá ao usuário uma visão rápida da
própria atividade: quantas ideias, tipos e processamentos existem, as últimas ideias
trabalhadas, um gráfico de atividade recente e atalhos para as ações comuns. Não cria nem
altera nada — apenas resume o que já existe nas outras áreas.

## Fronteiras

A Inteligência Artificial é **detalhe de infraestrutura**, não conceito de negócio deste
módulo. O módulo depende de um contrato abstrato de IA e nunca de um provedor específico,
o que permite trocar a tecnologia por baixo sem mexer nas regras de negócio.
