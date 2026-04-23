import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function createRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

describe("middleware", () => {
  it("/legal-changes → /legal/changes 301 리다이렉트", () => {
    const response = middleware(createRequest("/legal-changes"));
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toContain("/legal/changes");
  });

  it("/reports → /legal/reports 301 리다이렉트", () => {
    const response = middleware(createRequest("/reports"));
    expect(response.headers.get("location")).toContain("/legal/reports");
  });

  it("매칭되지 않는 경로는 통과시킨다", () => {
    const response = middleware(createRequest("/dashboard"));
    expect(response.headers.get("location")).toBeNull();
  });
});
