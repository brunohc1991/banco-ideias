import { toast } from 'sonner';
import { getMessage } from '@/shared/i18n';
import { ApiRequestError } from '../service/idea-type.api';

// Exibe cada código de erro traduzido; uma sessão expirada (401) encerra o login.
export function notifyProcessingError(error: unknown, logout: () => void): void {
  const locale = navigator.language;

  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      logout();
      return;
    }
    error.codes.forEach((code) => toast.error(getMessage(code, { locale })));
    return;
  }

  toast.error(getMessage('DEFAULT_API_ERROR', { locale }));
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(navigator.language, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
