# Spec Delta

## MODIFIED Requirements

### Requirement: Sidebar de navegação
O layout privado SHALL exibir uma sidebar de navegação funcional, única e plana (sem seletor de módulos), contendo os itens Dashboard, que leva a `/dashboard`, Tipos de Ideia, que leva a `/idea-types`, Ideias, que leva a `/ideas`, e Processamentos, que leva a `/processings`.

#### Scenario: Navegação pela sidebar
- **WHEN** o usuário clica em um item da sidebar
- **THEN** o app navega para a rota correspondente

#### Scenario: Itens do menu
- **WHEN** a sidebar privada é exibida
- **THEN** os itens são "Dashboard", "Tipos de Ideia", "Ideias" e "Processamentos", nessa ordem, sem rail de módulos

#### Scenario: Item ativo
- **WHEN** o usuário está em `/dashboard` ou em uma rota de `/idea-types`, `/ideas` ou `/processings`
- **THEN** o item correspondente aparece como ativo
