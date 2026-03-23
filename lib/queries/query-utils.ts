/**
 * Throws an error with the HTTP status attached, using the server's error message if available.
 */
export async function throwResponseError(res: Response, fallbackMessage: string): Promise<never> {
  let message = fallbackMessage;
  try {
    const body = await res.json();
    if (body.message) message = body.message;
  } catch {
    // Non-JSON error response — use fallback message
  }
  throw Object.assign(new Error(message), { status: res.status });
}

export async function fetchApi<T>(endpoint: string, errorMessage: string): Promise<T> {
  const res = await fetch(endpoint);
  if (!res.ok) return throwResponseError(res, errorMessage);
  return res.json();
}

export async function mutateApi<T>(
  endpoint: string,
  method: string,
  data: unknown,
  errorMessage: string,
): Promise<T> {
  const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return throwResponseError(res, errorMessage);
  return res.json();
}
