# Proposal

## Why

A aplicação ainda exibe o nome e o ícone genéricos de placeholder ("Aplicação" com ícone de camadas), e a área privada usa um menu modularizado (rail de módulos) e um módulo de exemplo que não fazem sentido para o produto. Antes de construir os casos de uso de domínio, é preciso fixar a identidade "Banco de Ideias" e simplificar a navegação.

## What Changes

- Nome oficial **"Banco de Ideias"** aplicado ao título da aba, à landing pública, a `/join` e à sidebar privada.
- Ícone da marca trocado para `BrainCircuit` (banco de ideias processado por IA), sem novos assets gráficos.
- Hero da landing com narrativa de banco de ideias ("Seu banco de ideias potencializado por IA") e CTA coerente.
- Logo (ícone + nome) visível e sincronizado em landing, `/join` e topo da sidebar privada; na sidebar comprimida, só o ícone.
- Menu lateral privado passa a ser único e plano, sem rail de módulos, com **apenas Dashboard**.
- Módulo de exemplo e suas rotas removidos; nova rota `/dashboard` com página vazia (placeholder).
- Rota inicial da área privada muda de `/example/dashboard` para `/dashboard`, inclusive no redirecionamento pós-login e em `/join` com sessão ativa.
- **BREAKING**: a rota `/example/dashboard` deixa de existir.

## Capabilities

### New Capabilities
- `brand-identity`: nome, ícone, título da aba e hero da landing que formam a identidade "Banco de Ideias", presente de forma consistente nas superfícies públicas e privadas.
- `app-dashboard`: rota `/dashboard` da área privada, entregue como página vazia de placeholder.

### Modified Capabilities
- `frontend-shell`: a sidebar privada passa a ser um menu plano único, com logo no topo e somente o item Dashboard.
- `join-page`: o destino pós-login e o redirecionamento com sessão ativa passam a ser `/dashboard`.

## Impact

- `apps/frontend` apenas: `app/layout.tsx`, `app/page.tsx`, `app/(public)/join/page.tsx`, `app/(private)/layout.tsx`, nova `app/(private)/dashboard/page.tsx`, remoção de `app/(private)/example/`, `shared/components/branding/app-logo.component.tsx`, `shared/components/ui/sidebar-menu.component.tsx` (topo do menu plano) e remoção de `shared/navigation/app-sidebar-navigation.component.tsx`.
- Sem mudanças em backend, módulos de domínio ou pacote `shared`.
- Origem do requisito: `.docs/004-personalizar-aplicacao/spec.md`.
