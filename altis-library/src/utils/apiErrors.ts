import axios from 'axios';
import type { ApiErrorResponse, FieldValidationError } from '@/types/apiError';

const handledSessionErrors = new WeakSet<object>();

export function markSessionErrorHandled(error: object): void {
  handledSessionErrors.add(error);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isRequestCanceled(error: unknown): boolean {
  return axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED');
}

export function getApiFieldErrors(error: unknown): string[] {
  if (!axios.isAxiosError(error) || !isRecord(error.response?.data)) return [];

  const body = error.response.data as Partial<ApiErrorResponse>;
  if (!Array.isArray(body.message)) return [];

  return body.message.flatMap((item: unknown) => {
    if (!isRecord(item)) return [];
    const fieldError = item as Partial<FieldValidationError>;
    return typeof fieldError.field === 'string' && fieldError.field.trim()
      ? [fieldError.field]
      : [];
  });
}

export function getApiErrorKey(error: unknown, fallback = 'errors.generic'): string {
  if (error instanceof Error && error.name === 'UnexpectedApiResponseError') {
    return 'errors.unexpectedResponse';
  }

  if (!axios.isAxiosError(error)) return fallback;
  if (handledSessionErrors.has(error)) return '';
  if (isRequestCanceled(error)) return '';

  const status = error.response?.status;
  if (status === 401) {
    const requestPath = error.config?.url?.split('?')[0] ?? '';
    if (fallback === 'login.error' || requestPath === '/auth/login') {
      return 'login.invalidCredentials';
    }
    if (['/auth/forgot-password', '/auth/reset-password'].includes(requestPath)) {
      return fallback;
    }
    return 'errors.unauthorized';
  }
  if (status === 403) return 'errors.forbidden';
  if (status === 404) return 'errors.notFound';
  if (status === 408 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'errors.timeout';
  }
  if (status === 409) return 'errors.conflict';
  if (status === 422 || status === 400) return 'errors.validation';
  if (status === 429) return 'errors.rateLimit';
  if (status === 502 || status === 503 || status === 504) return 'errors.serviceUnavailable';
  if (status !== undefined && status >= 500) return 'errors.server';

  if (error.code === 'ERR_NETWORK') return 'errors.network';
  if (!error.response) return 'errors.unknown';
  return fallback;
}

export function reportApiError(error: unknown): void {
  if (!import.meta.env.DEV || isRequestCanceled(error)) return;

  if (axios.isAxiosError(error)) {
    console.error('API request failed', {
      status: error.response?.status,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
    });
    return;
  }

  console.error(error);
}
