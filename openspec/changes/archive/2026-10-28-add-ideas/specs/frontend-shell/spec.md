# Spec Delta

## MODIFIED Requirements

### Requirement: Sidebar de navegação
O layout privado SHALL exibir uma sidebar de navegação funcional, única e plana (sem seletor de módulos), contendo os itens Dashboard, que leva a `/dashboard`, Tipos de Ideia, que leva a `/idea-types`, e Ideias, que leva a `/ideas`.

#### Scenario: Navegação pela sidebar
- **WHEN** o usuário clica em um item da sidebar
- **THEN** o app navega para a rota correspondente

#### Scenario: Itens do menu
- **WHEN** a sidebar privada é exibida
- **THEN** os itens são "Dashboard", "Tipos de Ideia" e "Ideias", nessa ordem, sem rail de módulos

#### Scenario: Item ativo
- **WHEN** o usuário está em `/dashboard` ou em uma rota de `/idea-types` ou de `/ideas`
- **THEN** o item correspondente aparece como ativo
