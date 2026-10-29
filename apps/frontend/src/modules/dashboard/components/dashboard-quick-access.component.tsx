import Link from 'next/link';
import { Lightbulb, Tags, Workflow } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const SHORTCUTS = [
  { href: '/ideas/new', label: 'Nova ideia', icon: Lightbulb },
  { href: '/idea-types/new', label: 'Novo tipo de ideia', icon: Tags },
  { href: '/processings/new', label: 'Novo processamento', icon: Workflow },
];

export default function DashboardQuickAccessComponent() {
  return (
    <section aria-labelledby="quick-access-title" className="space-y-3">
      <h2 id="quick-access-title" className="text-sm font-semibold text-zinc-300">
        Acesso rápido
      </h2>
      <div className="flex flex-wrap gap-3">
        {SHORTCUTS.map(({ href, label, icon: Icon }) => (
          <Button key={href} asChild variant="outline">
            <Link href={href}>
              <Icon className="size-4" />
              {label}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
