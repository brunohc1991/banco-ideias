import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ComposedBarLineChart } from '@/shared/components/ui/composed-bar-line-chart';
import type { DashboardActivityPoint } from '../service/dashboard.api';

const CHART_HEIGHT = 280;

type DashboardActivityChartProps = {
  activity: DashboardActivityPoint[] | null;
};

// `date` chega como `YYYY-MM-DD` em UTC; o rótulo é formatado também em UTC.
function formatDayLabel(value: string | number | null | undefined): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

function formatFullDay(value: string | number | null | undefined): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('pt-BR', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
}

export default function DashboardActivityChartComponent({ activity }: DashboardActivityChartProps) {
  const hasActivity = activity?.some((item) => item.ideasCreated > 0 || item.processingsExecuted > 0) ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade dos últimos 7 dias</CardTitle>
      </CardHeader>
      <CardContent>
        {activity === null ? (
          <div
            aria-label="Carregando gráfico"
            className="animate-pulse rounded-xl bg-white/5"
            style={{ height: CHART_HEIGHT }}
          />
        ) : (
          <ComposedBarLineChart
            data={hasActivity ? activity : []}
            xKey="date"
            barKey="processingsExecuted"
            lineKey="ideasCreated"
            barLabel="Processamentos"
            lineLabel="Ideias criadas"
            height={CHART_HEIGHT}
            xAxisTickFormatter={formatDayLabel}
            tooltipLabelFormatter={formatFullDay}
          />
        )}
      </CardContent>
    </Card>
  );
}
