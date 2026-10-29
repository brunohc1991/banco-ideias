import { Lightbulb, Tags, Workflow } from 'lucide-react';
import { MetricCard } from '@/shared/components/ui/metric-card';
import type { DashboardStats } from '../service/dashboard.api';

type DashboardStatsProps = {
  stats: DashboardStats | null;
};

function Value({ value }: { value: number | undefined }) {
  if (value === undefined) {
    return <span aria-label="Carregando" className="inline-block h-8 w-16 animate-pulse rounded-md bg-white/10" />;
  }

  return <>{new Intl.NumberFormat('pt-BR').format(value)}</>;
}

export default function DashboardStatsComponent({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        titleClassName="whitespace-normal"
        title="Ideias cadastradas"
        subtitle="Total de ideias registradas"
        value={<Value value={stats?.ideasCount} />}
        icon={<Lightbulb />}
        iconColorClassName="text-amber-300/70"
      />
      <MetricCard
        titleClassName="whitespace-normal"
        title="Tipos cadastrados"
        subtitle="Tipos de Ideia disponíveis"
        value={<Value value={stats?.ideaTypesCount} />}
        icon={<Tags />}
        iconColorClassName="text-sky-300/70"
      />
      <MetricCard
        titleClassName="whitespace-normal"
        title="Processamentos executados"
        subtitle="Gerações concluídas"
        value={<Value value={stats?.processingsCount} />}
        icon={<Workflow />}
        iconColorClassName="text-emerald-300/70"
      />
    </div>
  );
}
