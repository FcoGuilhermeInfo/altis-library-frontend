import axios from 'axios';

// The current API has no documented stable domain error codes. Never match
// translated backend prose; keep contextual fallbacks for validation/conflicts.
export function getApiErrorKey(error: unknown, fallback = 'errors.generic'): string {
  if (!axios.isAxiosError(error)) return fallback;
  const status = error.response?.status;
  if (!error.response) return 'errors.network';
  if (status === 401)
    return fallback === 'login.error' ? 'login.invalidCredentials' : 'errors.unauthorized';
  if (status === 403) return 'errors.forbidden';
  if (status === 404) return 'errors.notFound';
  if (status === 429) return 'errors.rateLimit';
  if (status !== undefined && status >= 500) return 'errors.server';
  return fallback;
}

export function reportApiError(error: unknown): void {
  if (axios.isAxiosError(error)) {
    // Preserve backend diagnostics without logging request credentials/tokens.
    console.error('API request failed', {
      status: error.response?.status,
      code: error.code,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
  } else {
    console.error(error);
  }
}
