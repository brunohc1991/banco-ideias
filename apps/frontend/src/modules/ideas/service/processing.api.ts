import type { ApiErrorResponse } from '@/shared/types/api-error.type';
import { ApiRequestError } from './idea-type.api';

export type ProcessingIteration = {
  id: string;
  refinement: string | null;
  result: string;
  position: number;
  createdAt: string;
};

export type ProcessingResource = {
  type: string;
  content: string;
  position: number;
};

export type ProcessingDetail = {
  id: string;
  ideaId: string;
  ideaName: string;
  ideaDescription: string;
  ideaObjective: string;
  ideaTypeId: string;
  ideaTypeName: string;
  resources: ProcessingResource[];
  iterations: ProcessingIteration[];
  createdAt: string;
  updatedAt: string;
};

export type ProcessingSummary = {
  id: string;
  ideaId: string;
  ideaName: string;
  ideaTypeName: string;
  iterationsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProcessingPage = {
  items: ProcessingSummary[];
  page: number;
  perPage: number;
  total: number;
};

export type IdeaSearchItem = {
  id: string;
  name: string;
  ideaTypeId: string;
  ideaTypeName: string;
};

const BASE_PATH = '/processings';

async function request<T>(
  token: string | null,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${BASE_PATH}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiRequestError(response.status, body?.errors?.length ? body.errors : ['DEFAULT_API_ERROR']);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function startProcessing(token: string | null, ideaId: string) {
  return request<ProcessingDetail>(token, '', { method: 'POST', body: { ideaId } });
}

export function refineProcessing(token: string | null, id: string, refinement: string) {
  return request<ProcessingIteration>(token, `/${id}/iterations`, { method: 'POST', body: { refinement } });
}

export function deleteProcessing(token: string | null, id: string) {
  return request<void>(token, `/${id}`, { method: 'DELETE' });
}

export function getProcessing(token: string | null, id: string) {
  return request<ProcessingDetail>(token, `/${id}`);
}

export function listProcessings(token: string | null, page: number, perPage: number) {
  return request<ProcessingPage>(token, `?page=${page}&perPage=${perPage}`);
}

export function searchIdeasToProcess(token: string | null, term: string) {
  return request<IdeaSearchItem[]>(token, `/idea-search?term=${encodeURIComponent(term)}`);
}
