'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { notifyProcessingError } from '@/modules/ideas/util/processing-error.util';
import { getDashboardSummary, type DashboardSummary } from '../service/dashboard.api';
import DashboardActivityChartComponent from './dashboard-activity-chart.component';
import DashboardLatestIdeasComponent from './dashboard-latest-ideas.component';
import DashboardQuickAccessComponent from './dashboard-quick-access.component';
import DashboardStatsComponent from './dashboard-stats.component';

export default function DashboardComponent() {
  const { token, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDashboardSummary(token)
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch((error: unknown) => {
        // Em caso de falha o esqueleto permanece e o erro aparece como toaster.
        if (!cancelled) notifyProcessingError(error, logout);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex flex-col gap-8">
      <PageSectionHeader
        badge="Visão geral"
        title="Dashboard"
        subtitle="Acompanhe suas ideias, tipos e processamentos."
      />

      <DashboardStatsComponent stats={summary?.stats ?? null} />
      <DashboardQuickAccessComponent />
      <DashboardActivityChartComponent activity={summary?.activity ?? null} />
      <DashboardLatestIdeasComponent ideas={summary?.latestIdeas ?? null} />
    </div>
  );
}
