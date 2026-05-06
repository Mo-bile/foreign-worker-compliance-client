export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
    public readonly alertMessage?: string,
    public readonly serverMessage: string = message,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getStringField(body: unknown, field: "alertMessage" | "message"): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : undefined;
}

type MockServerGlobal = typeof globalThis & {
  __fwcMswServerPromise?: Promise<void>;
  __fwcMswServerStarted?: boolean;
};

async function ensureMockServerStarted(): Promise<void> {
  if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") {
    return;
  }

  const mockGlobal = globalThis as MockServerGlobal;
  mockGlobal.__fwcMswServerPromise ??= import("@/mocks/server").then(({ server }) => {
    if (!mockGlobal.__fwcMswServerStarted) {
      server.listen({ onUnhandledRequest: "bypass" });
      mockGlobal.__fwcMswServerStarted = true;
    }
  });

  await mockGlobal.__fwcMswServerPromise;
}

function getBaseUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    return "http://localhost:8080";
  }
  if (!url) {
    throw new Error("BACKEND_URL environment variable is not set");
  }
  return url;
}

async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  await ensureMockServerStarted();
  return fetch(`${getBaseUrl()}${path}`, init);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText;
    let alertMessage: string | undefined;
    let serverMessage = response.statusText;
    try {
      const body = await response.json();
      alertMessage = getStringField(body, "alertMessage");
      serverMessage = getStringField(body, "message") || serverMessage;
      message = alertMessage || serverMessage;
    } catch {
      // body가 JSON이 아닌 경우 statusText 사용
    }
    throw new ApiError(response.status, response.statusText, message, alertMessage, serverMessage);
  }
  return response.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetchBackend(path, {
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(response);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchBackend(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

async function postAndFollow<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchBackend(path, {
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
  const response = await fetchBackend(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

async function putVoid(path: string, body: unknown): Promise<void> {
  const response = await fetchBackend(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await handleResponse(response);
  }
  // 204 No Content → body 없음
}

async function patch<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetchBackend(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  return handleResponse<T>(response);
}

async function patchVoid(path: string, body?: unknown): Promise<void> {
  const response = await fetchBackend(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    await handleResponse(response);
  }
}

async function postTrigger(path: string): Promise<void> {
  const response = await fetchBackend(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    await handleResponse(response);
  }
  // 201 + Location, body 없음
}

export const apiClient = { get, post, postAndFollow, put, putVoid, patch, patchVoid, postTrigger } as const;
