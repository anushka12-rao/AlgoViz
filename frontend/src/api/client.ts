export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function sanitizeErrorMessage(msg: string): string {
  // Guard against any accidental path leakage or technical dump
  if (
    msg.includes(':\\') ||
    msg.includes('/Users/') ||
    msg.includes('node_modules') ||
    msg.includes('algoviz-engine') ||
    msg.includes('Error:')
  ) {
    return 'The requested operation encountered an unexpected error.';
  }
  return msg;
}

export function getDefaultMessageForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Authentication required or session expired. Please log in.';
    case 403:
      return 'Access forbidden. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource or endpoint was not found.';
    case 409:
      return 'A conflict occurred with the current state of the resource.';
    case 422:
      return 'The submitted data was invalid.';
    default:
      if (status >= 500) {
        return 'Server error. The server encountered an internal issue. Please try again later.';
      }
      return `Request failed with status ${status}`;
  }
}

export function getDefaultCodeForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    default:
      if (status >= 500) {
        return 'SERVER_ERROR';
      }
      return 'API_ERROR';
  }
}

export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const hasBody = options?.body !== undefined && options?.body !== null;
  const isGetOrHead = method === 'GET' || method === 'HEAD';

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (
    hasBody &&
    !isGetOrHead &&
    !(typeof FormData !== 'undefined' && options?.body instanceof FormData) &&
    !(typeof Blob !== 'undefined' && options?.body instanceof Blob)
  ) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiError(
      'Unable to connect to the server. Please verify the backend is running.',
      0,
      'NETWORK_ERROR'
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        getDefaultMessageForStatus(response.status),
        response.status,
        getDefaultCodeForStatus(response.status)
      );
    }
    throw new ApiError(
      'Received an invalid response from the server.',
      response.status,
      'INVALID_RESPONSE'
    );
  }

  if (!response.ok || (data && data.success === false)) {
    const errorObj = data?.error;
    const rawMessage =
      typeof errorObj?.message === 'string' && errorObj.message.length > 0
        ? errorObj.message
        : getDefaultMessageForStatus(response.status);
    const safeMessage = sanitizeErrorMessage(rawMessage);
    const code =
      typeof errorObj?.code === 'string'
        ? errorObj.code
        : getDefaultCodeForStatus(response.status);
    throw new ApiError(safeMessage, response.status, code);
  }

  return data as T;
}
