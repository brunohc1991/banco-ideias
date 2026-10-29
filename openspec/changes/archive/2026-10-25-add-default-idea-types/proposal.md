# Proposal

## Why

Quem entra no sistema pela primeira vez precisa criar os Tipos de Ideia do zero, sem referência de como escrever um bom prompt. Uma biblioteca inicial pronta, importável com um clique, tira o atrito do começo e serve de modelo.

## What Changes

- Biblioteca fixa de Tipos de Ideia pré-definidos (roteiro de vídeo para rede social, roteiro de vídeo viral, vídeo VSL e resumo de conteúdo), com prompts multilinha usando os marcadores `{{name}}`, `{{description}}`, `{{objective}}` e `{{resources}}`.
- Nova regra de negócio que importa essa biblioteca para o usuário apenas quando ele não tem nenhum Tipo de Ideia, sem duplicar em chamadas repetidas.
- Novo endpoint autenticado `POST /idea-types/load-defaults`, que responde 200 com a quantidade carregada.
- Estado vazio da listagem ganha o botão "Carregar Tipos de Ideia padrão", que some quando o usuário passa a ter tipos.
- Mensagens de feedback traduzidas (pt/en) para o carregamento.
- Fora de escopo: bloquear a recarga depois que o usuário apaga todos os tipos (decisão do produto: a listagem vazia volta a permitir o carregamento), alteração dos endpoints CRUD existentes e novos tipos além dos quatro.

## Capabilities

### New Capabilities
- `default-idea-types`: biblioteca de Tipos de Ideia pré-definidos e sua importação idempotente para o usuário por endpoint autenticado.

### Modified Capabilities
- `idea-types-screens`: o estado vazio da listagem passa a oferecer também o carregamento dos tipos padrão, com feedback ao usuário.

## Impact

- `modules/ideas`: constante `DEFAULT_IDEA_TYPES` (portada do arquivo de referência `.docs/006-carregar-tipos-padrao/default-idea-types.constant.ts`), novo caso de uso e testes.
- `apps/backend`: rota nova em `idea-type.controller.ts` e cenários em `idea-type.integration.http`.
- `apps/frontend`: `idea-type.api.ts`, listagem de Tipos de Ideia e i18n pt/en.
- Sem mudança de banco nem nos endpoints CRUD. Depende da change `add-idea-types`, já arquivada.
- Origem do requisito: `.docs/006-carregar-tipos-padrao/spec.md`.
