type JsonBody = Record<string, unknown> | unknown[];

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON serializable body or any valid BodyInit. */
  body?: unknown;
  /** Automatically adds the bearer token header. */
  token?: string | null;
}

export interface ApiErrorPayload {
  message?: string;
  [key: string]: unknown;
}

export class ApiError<T = ApiErrorPayload> extends Error {
  public readonly status: number;
  public readonly data: T | null;

  constructor(message: string, status: number, data: T | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const { VITE_API_BASE_URL } = import.meta.env;

if (!VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE_URL is not defined. API requests will fail until it is configured.');
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isJsonBody = (body: unknown): body is JsonBody => {
  return Array.isArray(body) || isPlainObject(body);
};

const buildUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }

  const base = (VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${normalizedPath}`;
};

export async function apiRequest<TResponse = unknown>(
  path: string,
  { token, headers, body, ...rest }: ApiRequestOptions = {}
): Promise<TResponse> {
  const url = buildUrl(path);

  const finalHeaders = new Headers(headers);

  if (token && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (isJsonBody(body) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  const init: RequestInit = {
    ...rest,
    headers: finalHeaders
  };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = isJsonBody(body) ? JSON.stringify(body) : (body as BodyInit);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    let message = error instanceof Error ? error.message : 'Network request failed';
    if (/load failed/i.test(message)) {
      message = 'Unable to reach the server. Check your connection or API URL.';
    }
    // eslint-disable-next-line no-console
    console.error('API request failed before reaching server', { url, error });
    throw new ApiError(message || 'Network request failed', 0, null);
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const errorMessage =
      (typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : response.statusText) || 'Request failed';
    // eslint-disable-next-line no-console
    console.error('API request returned an error response', {
      url,
      status: response.status,
      message: errorMessage,
      payload
    });
    throw new ApiError(errorMessage, response.status, (payload as TResponse) ?? null);
  }

  return payload as TResponse;
}
