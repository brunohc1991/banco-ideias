import type { ApiErrorResponse } from '@/shared/types/api-error.type';

export type IdeaTypeSummary = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  updatedAt: string;
};

export type IdeaTypePage = {
  items: IdeaTypeSummary[];
  page: number;
  perPage: number;
  total: number;
};

export type IdeaTypeInput = Pick<IdeaTypeSummary, 'name' | 'description' | 'prompt'>;

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly codes: string[],
  ) {
    super(codes.join(', '));
  }
}

const BASE_PATH = '/idea-types';

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

export function listIdeaTypes(token: string | null, page: number, perPage: number) {
  return request<IdeaTypePage>(token, `?page=${page}&perPage=${perPage}`);
}

export function getIdeaType(token: string | null, id: string) {
  return request<IdeaTypeSummary>(token, `/${id}`);
}

export function createIdeaType(token: string | null, input: IdeaTypeInput) {
  return request<void>(token, '', { method: 'POST', body: input });
}

export function updateIdeaType(token: string | null, id: string, input: IdeaTypeInput) {
  return request<void>(token, `/${id}`, { method: 'PUT', body: input });
}

export function loadDefaultIdeaTypes(token: string | null) {
  return request<{ loaded: number }>(token, '/load-defaults', { method: 'POST' });
}

export function deleteIdeaType(token: string | null, id: string) {
  return request<void>(token, `/${id}`, { method: 'DELETE' });
}
