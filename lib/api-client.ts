export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error("BACKEND_URL environment variable is not set");
  }
  return url;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // body가 JSON이 아닌 경우 statusText 사용
    }
    throw new ApiError(response.status, response.statusText, message);
  }
  return response.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(response);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export const apiClient = { get, post } as const;
