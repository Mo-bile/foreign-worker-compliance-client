export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PUBLIC_API_MOCKING === "enabled" &&
    process.env.NODE_ENV !== "production"
  ) {
    try {
      const { server } = await import("./mocks/server");
      server.listen({ onUnhandledRequest: "bypass" });
      console.log("[MSW] Mock server started successfully");
    } catch (error) {
      console.error("[MSW] Failed to start mock server. API calls will not be intercepted:", error);
    }
  }
}
