# Design

## Context

O agregado `idea-type` já tem entidade validada, repositório (`create`, `findPage` filtrando por `userId` e ignorando excluídos), `SaveIdeaType`/`DeleteIdeaType`, controller autenticado em `/idea-types` e a listagem com estado vazio. A ordem de rotas do controller não conflita com um `POST /load-defaults`. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Importar a biblioteca de forma idempotente, sem alterar o contrato do repositório nem os endpoints CRUD.
- Manter os prompts exatamente como no arquivo de referência, legíveis e editáveis.

**Non-Goals:**
- Impedir a recarga após o usuário apagar tudo.
- Carga transacional em lote e novos tipos além dos quatro.

## Decisions

- **Constante portada, não reescrita.** `DEFAULT_IDEA_TYPES` vem do arquivo de referência em `.docs/006-carregar-tipos-padrao/`, copiado com o mesmo nome e conteúdo para `modules/ideas/src/idea-type/constant/`, com `constant/index.ts` e reexportação pelo agregado. Os prompts seguem como template literal multilinha.
- **Gate de idempotência por listagem.** O caso de uso consulta `findPage({ userId, page: 1, perPage: 1 })`; com `total > 0` devolve `{ loaded: 0 }` sem erro. Decisão do produto: como a listagem ignora registros excluídos, quem apaga tudo volta a poder carregar. A regra "nunca mais" do documento de origem fica de fora porque exigiria estender o repositório para contar excluídos.
- **Caso de uso de comando com saída.** `LoadDefaultIdeaTypes` recebe o repositório, entrada `{ userId }` e saída `{ loaded }`; cria cada item com `new IdeaType({ userId, ...item })` (o uuid vem da base `Entity`), valida e chama `create`.
- **Endpoint dedicado com 200 explícito**, instanciando o caso de uso no corpo do método do `IdeaTypeController`, como os demais.
- **Feedback no front-end.** Wrapper `loadDefaultIdeaTypes(token)` em `idea-type.api.ts`; sucesso com `loaded > 0` usa toaster de sucesso com a quantidade, `loaded === 0` usa toaster informativo. As mensagens entram no i18n com parâmetro de quantidade.

## Risks / Trade-offs

- [Falha no meio do carregamento deixa a biblioteca pela metade] → como o gate olha `total`, uma nova chamada não completaria o restante; aceito para o MVP (4 itens), com os itens já validados antes de persistir.
- [Duas chamadas simultâneas podem duplicar] → o botão desabilita durante a chamada; sem trava no servidor nesta entrega.
- [Recarga permitida após apagar tudo diverge da regra "nunca mais" do documento] → decisão explícita do produto, registrada acima.
