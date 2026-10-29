# Proposal

## Why

Uma Ideia sozinha dá pouco material para a IA. Material de apoio (textos, referências, trechos) enriquece o que será enviado no processamento, e o produto já prevê que a Ideia reúna "recursos de contexto". Esta etapa entrega esse material como parte da própria Ideia, antes de existir o processamento.

## What Changes

- A Ideia passa a ter uma lista de **Recursos**, cada um com tipo, conteúdo e posição. No MVP o único tipo é `text`, mas o modelo aceita novos tipos depois sem quebrar compatibilidade.
- Os Recursos pertencem à Ideia: são gravados, atualizados e excluídos junto com ela, de forma atômica, sem endpoints próprios.
- `POST /ideas` e `PUT /ideas/:id` aceitam a lista de recursos (no `PUT`, a lista enviada substitui a anterior); `GET /ideas/:id` devolve os recursos ordenados; `GET /ideas` continua sem recursos.
- Limites e validações: no máximo 20 recursos por Ideia, conteúdo de 1 a 20000 caracteres, tipo suportado, posição inteira não negativa e ids sem repetição.
- Formulário de Ideia ganha a seção "Recursos", para adicionar, editar, reordenar e remover recursos antes de salvar.
- Mensagens de erro dos recursos em português e inglês.
- Fora de escopo: processamento por IA, outros tipos de recurso, endpoints de recurso, contagem de recursos na listagem e reordenação por arrastar.

## Capabilities

### New Capabilities
- `idea-resources`: lista de Recursos de uma Ideia (regras, limites, leitura e escrita por substituição, exclusão em cascata e erros).
- `idea-resources-screens`: seção "Recursos" do formulário de Ideia para adicionar, editar, reordenar e remover recursos.

### Modified Capabilities
<!-- Nenhuma: as capabilities de Ideia (`ideas` e `ideas-screens`) ainda serão criadas pela change `add-ideas`; por isso o comportamento dos recursos é descrito em capabilities próprias. -->

## Impact

- `modules/ideas`: nova entidade `Resource` dentro do agregado `idea`, `Idea` validando a coleção, `IdeaRepository` e seu fake, casos de uso `save-idea` e `delete-idea` e testes.
- `apps/backend`: model e migration `resources` (cascata a partir de `ideas`), `PrismaIdeaRepository` transacional, `idea.controller.ts` e `idea.integration.http`.
- `apps/frontend`: tipos e API de Ideia, novo componente de recursos, formulário de Ideia e i18n pt/en.
- Banco: nova tabela `resources`.
- Depende da change `add-ideas` (ainda não aplicada), cujos agregado, controller e formulário esta change estende.
- Origem do requisito: `.docs/009-recursos-da-ideia/spec.md`.
