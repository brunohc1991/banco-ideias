# Design

## Context

A change `add-ideas` (ainda não aplicada) cria o agregado `idea`, `IdeaRepository` com `findById` sem filtro de usuário e `findPage` por usuário, `SaveIdea`/`DeleteIdea`, o `PrismaIdeaRepository`, o `idea.controller.ts` e o formulário de Ideia. Esta change estende esses artefatos, então deve ser aplicada depois dela. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Recurso como entidade interna do agregado `idea`, persistida junto com a Ideia.
- Modelo plano (`type`, `content`, `position`) que aceite novos tipos por extensão do conjunto de tipos.

**Non-Goals:**
- Repositório, casos de uso ou controller de Recurso; tipos além de `text`; processamento por IA.
- Reordenar por arrastar e contagem de recursos na listagem.

## Decisions

- **Mestre-detalhe no agregado.** `IdeaRepository` continua sendo a fronteira de persistência: `create` e `update` gravam a Ideia e os recursos numa transação; `delete` depende da cascata do banco (chave estrangeira `Cascade`); `findById` carrega os recursos ordenados por `position` e `createdAt`; `findPage` não os carrega.
- **`Resource` herda de `Entity`**, com `type` (união, só `'text'`), `content` (1..20000) e `position` (inteiro >= 0, validado com as regras de inteiro e de valor mínimo já existentes). `Idea.validate()` valida a coleção (máximo 20, `idea.resources.too_many`; ids únicos, `idea.resources.duplicate_id`) e delega a cada item. Sem `userId` no recurso: o dono é o da Ideia.
- **Erro de tipo.** `SaveIdea` verifica o tipo antes de criar a entidade: valor informado fora do conjunto → `idea.resource.type.unsupported`; ausente → segue para a validação da entidade, que gera `idea.resource.type.required`. Assim os dois códigos do documento de origem têm cenários distintos.
- **Reconciliação no `update`.** Dentro da transação: atualiza a Ideia; remove os recursos da própria Ideia que não vieram; atualiza os que vieram e já pertencem a ela; cria os demais. Todos os predicados incluem o `ideaId`. Para não colidir com chave primária nem apropriar-se de recurso alheio, um `id` que não pertence à Ideia atual vira um recurso novo com id gerado, em vez de reaproveitar o id recebido. O documento de origem diz criar "com id que não existe"; a regra acima cobre também o caso de o id existir em outra Ideia.
- **`resources` ausente = lista vazia**, como no documento de origem. No `PUT`, isso apaga os recursos de quem não enviar o campo; aceito porque a atualização é por substituição.
- **Resposta.** `GET /ideas/:id` inclui `resources` (`id`, `type`, `content`, `position`, sem datas); `GET /ideas` não inclui. Helper separado para o detalhe.
- **Front-end.** Componente controlado `IdeaResourcesInput` (valor e `onChange`), sem chamadas de API; reordenação por botões recalcula `position` sequencial; a lista segue no payload de criar e atualizar. Tipos e API de Ideia do front-end são estendidos conforme a estrutura que `add-ideas` criar (os nomes de arquivos do documento de origem, como `api/idea.api.ts` e `types/idea.type.ts`, podem diferir).
- **Memória.** O documento de origem cita `.spec/memory/dominio.md`, que não existe; o conceito de Recurso fica registrado em `openspec/memory/modules/ideas.md`.

## Risks / Trade-offs

- [Enviar `PUT` sem `resources` apaga os recursos existentes] → coerente com a substituição completa; o formulário sempre envia a lista inteira.
- [Falha parcial na transação deixaria Ideia e recursos inconsistentes] → tudo em uma única transação.
- [Nomes de arquivos do front-end divergentes do documento de origem] → seguir a estrutura real criada por `add-ideas`.
- [Migration em banco compartilhado] → migration incremental nomeada `resources`.

## Open Questions

- Nenhuma que mude os requisitos; os caminhos finais dos arquivos do front-end são confirmados na aplicação.
