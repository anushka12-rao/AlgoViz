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

export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
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
        : `Request failed with status ${response.status}`;
    const safeMessage = sanitizeErrorMessage(rawMessage);
    const code = typeof errorObj?.code === 'string' ? errorObj.code : 'API_ERROR';
    throw new ApiError(safeMessage, response.status, code);
  }

  return data as T;
}
