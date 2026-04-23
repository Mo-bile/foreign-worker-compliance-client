import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LEGACY_REDIRECTS: ReadonlyMap<string, string> = new Map([
  ["/legal-changes", "/legal/changes"],
  ["/reports", "/legal/reports"],
]);

export function middleware(request: NextRequest) {
  const target = LEGACY_REDIRECTS.get(request.nextUrl.pathname);

  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/legal-changes", "/reports"],
};
