'use client';

import { useRouter } from 'next/navigation';
import { Lightbulb, LayoutDashboard, Tags, Workflow } from 'lucide-react';
import { AuthGuard, useAuth } from '@/modules/auth';
import { ShellProvider } from '@/shared/context/shell.context';
import { AdminShell } from '@/shared/template/admin-shell.component';
import { SidebarMenu, type SidebarMenuSection } from '@/shared/components/ui/sidebar-menu.component';

// ── Rotas ─────────────────────────────────────────────────────────────────────

const DASHBOARD_ROUTE = '/dashboard';
const IDEA_TYPES_ROUTE = '/idea-types';
const IDEAS_ROUTE = '/ideas';
const PROCESSINGS_ROUTE = '/processings';

// ── Estrutura de navegação ─────────────────────────────────────────────────────
// Menu único e plano. Adicione novos itens aqui conforme as telas ficarem prontas.

const MENU_SECTIONS: SidebarMenuSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: DASHBOARD_ROUTE,
        icon: LayoutDashboard,
        match: 'exact',
      },
      {
        id: 'idea-types',
        label: 'Tipos de Ideia',
        href: IDEA_TYPES_ROUTE,
        icon: Tags,
        match: 'prefix',
      },
      {
        id: 'ideas',
        label: 'Ideias',
        href: IDEAS_ROUTE,
        icon: Lightbulb,
        match: 'prefix',
      },
      {
        id: 'processings',
        label: 'Processamentos',
        href: PROCESSINGS_ROUTE,
        icon: Workflow,
        match: 'prefix',
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────

export default function PrivateGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/join');
  }

  return (
    <AuthGuard>
      <ShellProvider defaultOpen>
        <AdminShell
          sidebar={<SidebarMenu sections={MENU_SECTIONS} />}
          userName={user?.name}
          userEmail={user?.email}
          onLogout={handleLogout}
        >
          {children}
        </AdminShell>
      </ShellProvider>
    </AuthGuard>
  );
}
