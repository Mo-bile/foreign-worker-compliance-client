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

async function postAndFollow<T>(path: string, body: unknown): Promise<T> {
  const base = getBaseUrl();
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return handleResponse<T>(response);
  }

  if (response.status === 201) {
    const location = response.headers.get("Location");
    if (location) {
      const followPath = location.startsWith("/") ? location : `/${location}`;
      return get<T>(followPath);
    }
  }

  return response.json() as Promise<T>;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

async function patch(path: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    await handleResponse(response);
  }
  // 204 No Content → body 없음
}

export const apiClient = { get, post, postAndFollow, put, patch } as const;
