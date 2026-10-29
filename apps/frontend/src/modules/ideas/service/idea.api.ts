import type { ApiErrorResponse } from '@/shared/types/api-error.type';
import { ApiRequestError } from './idea-type.api';

export type IdeaSummary = {
  id: string;
  name: string;
  description: string;
  objective: string;
  ideaTypeId: string;
  updatedAt: string;
};

export type IdeaResource = {
  id?: string;
  type: 'text';
  content: string;
  position: number;
};

export type IdeaDetail = IdeaSummary & { resources: IdeaResource[] };

export type IdeaPage = {
  items: IdeaSummary[];
  page: number;
  perPage: number;
  total: number;
};

export type IdeaInput = Pick<IdeaSummary, 'name' | 'description' | 'objective' | 'ideaTypeId'> & {
  resources: IdeaResource[];
};

const BASE_PATH = '/ideas';

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

export function listIdeas(token: string | null, page: number, perPage: number) {
  return request<IdeaPage>(token, `?page=${page}&perPage=${perPage}`);
}

export function getIdea(token: string | null, id: string) {
  return request<IdeaDetail>(token, `/${id}`);
}

export function createIdea(token: string | null, input: IdeaInput) {
  return request<void>(token, '', { method: 'POST', body: input });
}

export function updateIdea(token: string | null, id: string, input: IdeaInput) {
  return request<void>(token, `/${id}`, { method: 'PUT', body: input });
}

export function deleteIdea(token: string | null, id: string) {
  return request<void>(token, `/${id}`, { method: 'DELETE' });
}
