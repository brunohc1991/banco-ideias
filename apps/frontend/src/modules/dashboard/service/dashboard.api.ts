import type { ApiErrorResponse } from '@/shared/types/api-error.type';
import { ApiRequestError } from '@/modules/ideas/service/idea-type.api';

export type DashboardStats = {
  ideasCount: number;
  ideaTypesCount: number;
  processingsCount: number;
};

export type DashboardLatestIdea = {
  id: string;
  name: string;
  ideaTypeId: string;
  ideaTypeName: string;
  updatedAt: string;
};

export type DashboardActivityPoint = {
  date: string;
  ideasCreated: number;
  processingsExecuted: number;
};

export type DashboardSummary = {
  stats: DashboardStats;
  latestIdeas: DashboardLatestIdea[];
  activity: DashboardActivityPoint[];
};

export async function getDashboardSummary(
  token: string | null,
  options: { latestLimit?: number } = {},
): Promise<DashboardSummary> {
  const query = options.latestLimit !== undefined ? `?latestLimit=${options.latestLimit}` : '';
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiRequestError(response.status, body?.errors?.length ? body.errors : ['DEFAULT_API_ERROR']);
  }

  return (await response.json()) as DashboardSummary;
}
