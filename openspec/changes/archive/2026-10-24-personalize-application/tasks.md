# Tasks

## 1. Identidade

- [x] 1.1 Em `app-logo.component.tsx`, definir `APP_NAME = 'Banco de Ideias'`, trocar `Layers` por `BrainCircuit` e remover o comentário de placeholder. Verificar com `npx tsc --noEmit` limpo e o símbolo novo renderizado.
- [x] 1.2 Em `app/layout.tsx`, definir `metadata.title` como `Banco de Ideias` e a `description` como uma frase curta sobre banco de ideias processadas por IA. Verificar a aba do navegador exibindo o título.
- [x] 1.3 Em `app/page.tsx`, trocar wordmark e ícones (header e hero) por "Banco de Ideias" e `BrainCircuit`, e reescrever hero (título "Seu banco de ideias / potencializado por IA", subtítulo e CTA coerente). Verificar visualmente a landing.
- [x] 1.4 Em `app/(public)/join/page.tsx`, trocar `Layers` por `BrainCircuit` e o h1 por "Banco de Ideias". Verificar com `grep -rn "Aplicação\|Layers" apps/frontend/src` sem ocorrências com sentido de marca.

## 2. Dashboard e menu

- [x] 2.1 Criar `app/(private)/dashboard/page.tsx` como Server Component com título "Dashboard" e placeholder "Em construção", sem dados nem API. Verificar abrindo `/dashboard` autenticado.
- [x] 2.2 Apagar `app/(private)/example/` e verificar com `grep -rn "example" apps/frontend/src` sem referências remanescentes.
- [x] 2.3 Em `shared/components/ui/sidebar-menu.component.tsx`, fazer o ramo de menu plano renderizar `<AppLogo>` no topo, linkando para `/dashboard` e mostrando só o ícone quando `isCollapsed`, sem alterar a API `moduleNavigation`. Verificar sidebar expandida e comprimida.
- [x] 2.4 Em `app/(private)/layout.tsx`, remover `APP_MODULES` e constantes de exemplo, adicionar `DASHBOARD_ROUTE = '/dashboard'` e alimentar `SidebarMenu` com uma seção sem `label` contendo só Dashboard (`exact`, ícone `LayoutDashboard`). Apagar `app-sidebar-navigation.component.tsx` e a pasta `navigation/` se ficarem vazios. Verificar `tsc` limpo e menu com um único item, sem rail.
- [x] 2.5 Trocar todo destino `/example/dashboard` por `/dashboard` (login em `join/page.tsx` e redirecionamento com sessão ativa). Verificar com `grep -rn "/example" apps/frontend/src` vazio.

## 3. Validação integrada

- [x] 3.1 Rodar `npx tsc --noEmit` e `npm run build` em `apps/frontend` sem erros.
- [x] 3.2 Validar no navegador e registrar evidência: título da aba; logo igual na landing, `/join` e sidebar (expandida com texto, comprimida só ícone); hero novo; login cai em `/dashboard`; menu só com Dashboard e sem rail; `/example/dashboard` não encontrada.
