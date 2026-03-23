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
