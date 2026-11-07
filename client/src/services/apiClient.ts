type CsrfToken = {
  headerName: string;
  token: string;
};

let csrfToken: CsrfToken | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function clearCsrf() {
  csrfToken = null;
}

export async function refreshCsrf(): Promise<void> {
  const response = await fetch('/api/auth/csrf', {
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      'Unable to initialize session security'
    );
  }

  csrfToken = await response.json();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  const mutating = !['GET', 'HEAD', 'OPTIONS', 'TRACE']
    .includes(method);

  if (mutating && !csrfToken) {
    await refreshCsrf();
  }

  const headers = new Headers(options.headers);

  if (typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (mutating && csrfToken) {
    headers.set(csrfToken.headerName, csrfToken.token);
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    method,
    headers,
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 401
        ? 'Invalid credentials or expired session'
        : `Request failed (HTTP ${response.status})`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}