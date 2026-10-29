# Spec Delta

## MODIFIED Requirements

### Requirement: Sidebar de navegação
O layout privado SHALL exibir uma sidebar de navegação funcional, única e plana (sem seletor de módulos), contendo apenas o item Dashboard, que leva a `/dashboard`.

#### Scenario: Navegação pela sidebar
- **WHEN** o usuário clica em um item da sidebar
- **THEN** o app navega para a rota correspondente

#### Scenario: Itens do menu
- **WHEN** a sidebar privada é exibida
- **THEN** o único item é "Dashboard", sem rail de módulos e sem outros itens

#### Scenario: Item ativo
- **WHEN** o usuário está em `/dashboard`
- **THEN** o item Dashboard aparece como ativo
