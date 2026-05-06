/**
 * Throws an error with the HTTP status attached, using the user-facing alert message if available.
 */
function getStringField(body: unknown, field: "alertMessage" | "message"): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : undefined;
}

export async function throwResponseError(res: Response, fallbackMessage: string): Promise<never> {
  let message = fallbackMessage;
  try {
    const body = await res.json();
    message = getStringField(body, "alertMessage") || getStringField(body, "message") || message;
  } catch {
    console.warn(
      `[throwResponseError] Non-JSON error response: status=${res.status}, ` +
        `content-type=${res.headers.get("content-type")}`,
    );
  }
  throw Object.assign(new Error(message), { status: res.status });
}

export async function fetchApi<T>(endpoint: string, errorMessage: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(endpoint);
  } catch (error) {
    throw new Error(errorMessage, { cause: error });
  }
  if (!res.ok) return throwResponseError(res, errorMessage);
  try {
    return (await res.json()) as T;
  } catch (error) {
    throw new Error(`${errorMessage} (응답 형식 오류)`, { cause: error });
  }
}

export async function patchApi(endpoint: string, errorMessage: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw new Error(errorMessage, { cause: error });
  }
  if (!res.ok) return throwResponseError(res, errorMessage);
  // 204 No Content → body 없음
}

export async function patchApiWithBody<T>(
  endpoint: string,
  errorMessage: string,
  body: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(errorMessage, { cause: error });
  }
  if (!res.ok) return throwResponseError(res, errorMessage);
  try {
    return (await res.json()) as T;
  } catch (error) {
    throw new Error(`${errorMessage} (응답 형식 오류)`, { cause: error });
  }
}

export async function mutateApi<T>(
  endpoint: string,
  method: string,
  data: unknown,
  errorMessage: string,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error(errorMessage, { cause: error });
  }
  if (!res.ok) return throwResponseError(res, errorMessage);
  try {
    return (await res.json()) as T;
  } catch (error) {
    throw new Error(`${errorMessage} (응답 형식 오류)`, { cause: error });
  }
}

export async function mutateApiVoid(
  endpoint: string,
  method: string,
  data: unknown,
  errorMessage: string,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error(errorMessage, { cause: error });
  }
  if (!res.ok) return throwResponseError(res, errorMessage);
  // 204 No Content → body 없음
}
