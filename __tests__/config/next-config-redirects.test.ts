import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("next.config redirects", () => {
  it("/compliance permanently redirects to /deadlines", async () => {
    const redirectsFn = nextConfig.redirects;
    expect(redirectsFn).toBeTypeOf("function");
    if (typeof redirectsFn !== "function") {
      throw new Error("Expected nextConfig.redirects to be configured");
    }

    const redirects = await redirectsFn();

    expect(redirects).toContainEqual({
      source: "/compliance",
      destination: "/deadlines",
      permanent: true,
    });
  });
});
