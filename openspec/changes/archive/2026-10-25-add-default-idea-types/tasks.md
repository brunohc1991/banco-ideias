# Tasks

## 1. Domínio (módulo `ideas`)

- [x] 1.1 Copiar `.docs/006-carregar-tipos-padrao/default-idea-types.constant.ts` (nome e conteúdo idênticos) para `modules/ideas/src/idea-type/constant/`, criar `constant/index.ts` e reexportar pelo `idea-type/index.ts`. Verificar com `diff` sem diferenças entre os dois arquivos e `DEFAULT_IDEA_TYPES` importável de `@ideias/ideas`.
- [x] 1.2 Implementar `LoadDefaultIdeaTypes` (`module-use-case`): entrada `{ userId }`, saída `{ loaded }`; `findPage({ userId, page: 1, perPage: 1 })` com `total > 0` devolve `{ loaded: 0 }` sem erro, senão valida e cria cada item da constante para o usuário. Verificar com o build do módulo sem erros.
- [x] 1.3 Testes unitários com `FakeIdeaTypeRepository`: usuário sem tipos (quantidade e `userId` corretos), usuário com tipo existente (`loaded` 0 e nada criado), chamada repetida sem duplicar, isolamento entre usuários, e cada item da constante válido como `IdeaType`. Verificar com a suíte passando e cobertura de 100% no caso de uso.

## 2. Back-end

- [x] 2.1 Adicionar `POST /idea-types/load-defaults` em `idea-type.controller.ts`, autenticado, instanciando `LoadDefaultIdeaTypes` no corpo do método com o `userId` do usuário e respondendo 200 com `{ loaded }`. Verificar com `npx tsc --noEmit` limpo e chamada real ao backend.
- [x] 2.2 Estender `idea-type.integration.http` com carregamento do usuário sem tipos (`loaded` igual ao tamanho da biblioteca), segunda chamada (`loaded` 0), `GET /idea-types` confirmando que o total não mudou e chamada sem token (401). Verificar executando os cenários com o backend rodando.

## 3. Front-end

- [x] 3.1 Adicionar `loadDefaultIdeaTypes(token)` em `idea-type.api.ts` e as mensagens pt/en de sucesso (com quantidade) e informativa em `messages.pt.ts` e `messages.en.ts`. Verificar com `npx tsc --noEmit` limpo.
- [x] 3.2 Estender o estado vazio da listagem com o botão "Carregar Tipos de Ideia padrão" ao lado de "Cadastrar Tipo de Ideia": desabilitado durante a chamada, toaster de sucesso ou informativo, recarga da listagem, e botão ausente quando há tipos. Verificar no navegador cada cenário da spec.

## 4. Validação integrada

- [x] 4.1 Rodar `npx tsc --noEmit` e o build do front-end, o build e os testes do backend e dos módulos, todos sem erros.
- [x] 4.2 Validar no navegador e registrar evidência: estado vazio com os dois botões, carregamento com toaster e tabela preenchida, botão ausente com tipos, lista esvaziada voltando a mostrar o botão, e erro traduzido.
