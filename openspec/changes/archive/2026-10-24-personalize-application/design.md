# Design

## Context

Mudança restrita a `apps/frontend`. Hoje o layout privado alimenta o `SidebarMenu` com `moduleNavigation` (via `AppSidebarNavigation`), e o caminho de menu plano do `SidebarMenu` não renderiza logo no topo; só os caminhos com `moduleNavigation` o fazem. O logo vem de `AppLogo`, que já suporta `showText`/`showMark`. Veja `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Identidade única em um só lugar (`APP_NAME` e `AppLogoMark`), reutilizada nas superfícies.
- Menu privado plano com um único item.

**Non-Goals:**
- Refatorar ou remover a API `moduleNavigation` do `SidebarMenu`.
- Novos assets gráficos, favicon ou wordmark customizado.
- Conteúdo real do dashboard e itens "Tipos de Ideia"/"Ideias" no menu.

## Decisions

- **Ícone via `lucide-react`:** trocar `Layers` por `BrainCircuit` em `AppLogoMark`, na landing e em `/join`, mantendo classes e props. Alternativa descartada: SVG próprio (fora de escopo).
- **Logo no caminho plano do `SidebarMenu`:** o documento de origem diz que o `SidebarMenu` "não muda" e, ao mesmo tempo, exige logo no topo do menu plano. Conciliação adotada: alterar apenas o ramo plano para renderizar `<AppLogo>` (link para `/dashboard`; `showText={false}` quando `isCollapsed`), sem tocar na API `moduleNavigation`.
- **Menu direto no layout privado:** o layout passa uma única seção sem `label` ao `SidebarMenu`; `AppSidebarNavigation` e a pasta `navigation/` são apagados se ficarem sem consumidores.
- **Dashboard como Server Component simples**, com título e placeholder, sem dados.
- **Rota única `DASHBOARD_ROUTE = '/dashboard'`** substitui as referências a `/example/dashboard` (login, `/join`).

## Risks / Trade-offs

- [Link quebrado para `/example/dashboard` em marcadores ou cookies] → a rota é removida; o guard redireciona deslogados e o login já aponta para `/dashboard`.
- [Referências residuais a "Aplicação" ou `/example`] → busca por texto antes de concluir.
- [Sem validação automatizada de UI] → conferência manual no navegador, além de `tsc` e `build`.
