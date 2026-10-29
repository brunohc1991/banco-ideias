import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyListState } from '@/shared/components/ui/empty-list-state';
import type { DashboardLatestIdea } from '../service/dashboard.api';

const SKELETON_ROWS = 5;

type DashboardLatestIdeasProps = {
  ideas: DashboardLatestIdea[] | null;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(navigator.language, { dateStyle: 'short', timeStyle: 'short' });
}

export default function DashboardLatestIdeasComponent({ ideas }: DashboardLatestIdeasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Últimas ideias atualizadas</CardTitle>
      </CardHeader>
      <CardContent>
        {ideas === null ? (
          <ul aria-label="Carregando ideias" className="space-y-3">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <li key={index} className="h-10 animate-pulse rounded-md bg-white/5" />
            ))}
          </ul>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-6">
            <EmptyListState
              title="Você ainda não cadastrou nenhuma ideia."
              subtitle="Cadastre a primeira para começar."
            />
            <Button asChild>
              <Link href="/ideas/new">
                <Plus className="size-4" />
                Nova Ideia
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {ideas.map((idea) => (
              <li key={idea.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Link href={`/ideas/${idea.id}/edit`} className="truncate font-medium hover:underline">
                    {idea.name}
                  </Link>
                  <Badge variant="secondary">{idea.ideaTypeName}</Badge>
                </div>
                <time dateTime={idea.updatedAt} className="text-sm text-muted-foreground">
                  {formatDateTime(idea.updatedAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
