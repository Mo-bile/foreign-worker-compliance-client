import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { ApiError } from "@/lib/api-client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

export function handleRouteError(error: unknown, context: string): NextResponse {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      console.error(`[${context}] Backend error: ${error.status} ${error.message}`);
    } else {
      console.warn(`[${context}] Backend returned ${error.status}: ${error.message}`);
    }
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  console.error(`[${context}] Unexpected error:`, error);
  return NextResponse.json(
    { message: ERROR_MESSAGES.SERVER_ERROR },
    { status: 500 },
  );
}

export async function parseRequestBody(
  request: Request,
): Promise<{ data: unknown } | NextResponse> {
  try {
    const data: unknown = await request.json();
    return { data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: ERROR_MESSAGES.INVALID_REQUEST_FORMAT },
        { status: 400 },
      );
    }
    console.error("[parseRequestBody] Unexpected error reading request body:", error);
    return NextResponse.json(
      { message: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 },
    );
  }
}

export function validateSchema<T>(
  schema: ZodSchema<T>,
  body: unknown,
): { data: T } | NextResponse {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT;
    return NextResponse.json({ message: firstError }, { status: 400 });
  }
  return { data: parsed.data };
}
