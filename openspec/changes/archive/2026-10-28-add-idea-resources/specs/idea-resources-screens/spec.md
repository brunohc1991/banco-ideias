# Spec Delta

## Purpose

Permite que a pessoa mantenha, no próprio formulário da Ideia, a lista de recursos de contexto antes de salvar.

## ADDED Requirements

### Requirement: Seção Recursos no formulário de Ideia
O formulário de Ideia (criação e edição) SHALL ter a seção "Recursos", abaixo de "Classificação", com a lista de recursos da Ideia.

#### Scenario: Criar sem recursos
- **WHEN** a pessoa abre `/ideas/new`
- **THEN** a seção "Recursos" aparece com um estado vazio "Nenhum recurso adicionado." e o botão "Adicionar recurso"

#### Scenario: Editar com recursos
- **WHEN** a pessoa abre `/ideas/[id]/edit` de uma Ideia com recursos
- **THEN** a seção mostra os recursos da Ideia na ordem salva

### Requirement: Adicionar e editar recursos
A seção SHALL permitir adicionar um recurso de texto novo no fim da lista e editar o conteúdo de cada recurso em um campo de texto longo, com o tipo exibido como "Texto".

#### Scenario: Adicionar recurso
- **WHEN** a pessoa aciona "Adicionar recurso"
- **THEN** um recurso de texto vazio é acrescentado ao fim da lista

#### Scenario: Editar conteúdo
- **WHEN** a pessoa altera o texto de um recurso
- **THEN** a alteração fica na lista até o formulário ser salvo

### Requirement: Remover e reordenar recursos
Cada recurso SHALL poder ser removido e movido para cima ou para baixo, e a ordem resultante SHALL ser a ordem salva.

#### Scenario: Mover para cima
- **WHEN** a pessoa move um recurso para cima
- **THEN** ele troca de lugar com o anterior e as posições seguem sequenciais

#### Scenario: Remover recurso
- **WHEN** a pessoa remove um recurso
- **THEN** ele sai da lista e as posições dos demais seguem sequenciais

### Requirement: Recursos salvos junto com a Ideia
Ao salvar o formulário, a lista de recursos SHALL ser enviada junto com os dados da Ideia, sem chamadas separadas por recurso.

#### Scenario: Salvar
- **WHEN** a pessoa salva a Ideia com recursos adicionados, editados e removidos
- **THEN** a Ideia passa a ter exatamente a lista exibida no formulário

#### Scenario: Erro de recurso
- **WHEN** o backend responde 422 com erros de recursos
- **THEN** um toaster traduzido é exibido para cada código e a lista editada é mantida

### Requirement: Acessibilidade da lista
Os campos e botões da lista de recursos SHALL ter rótulos acessíveis que identifiquem o recurso e a ação.

#### Scenario: Rótulos
- **WHEN** a lista é percorrida por tecnologia assistiva
- **THEN** cada campo identifica seu número ("Conteúdo do recurso N") e cada botão a ação (mover para cima, mover para baixo, remover)

### Requirement: Listagem de Ideias inalterada
A listagem de Ideias SHALL permanecer com as colunas atuais, sem contagem de recursos.

#### Scenario: Colunas da listagem
- **WHEN** a pessoa abre `/ideas`
- **THEN** as colunas continuam sendo Nome, Tipo de Ideia, Atualizado em e ações
