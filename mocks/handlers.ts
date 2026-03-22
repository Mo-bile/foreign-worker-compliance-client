import { http, HttpResponse } from "msw";
import { mockWorkers, mockOverdueDeadlines, mockUpcomingDeadlines } from "./data";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

export const handlers = [
  http.get(`${BACKEND}/api/workers`, () => HttpResponse.json(mockWorkers)),
  // Next.js Route Handler relative paths (used by React Query hooks in jsdom tests)
  // Specific routes must come before wildcard list routes to avoid shadowing
  http.get("*/api/workers/:id", ({ params }) => {
    const worker = mockWorkers.find((w) => w.id === Number(params.id));
    if (!worker) {
      return HttpResponse.json(
        {
          status: 404,
          error: "Not Found",
          message: "근로자를 찾을 수 없습니다",
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }
    return HttpResponse.json(worker);
  }),
  http.get("*/api/workers", () => HttpResponse.json(mockWorkers)),

  http.get(`${BACKEND}/api/workers/:id`, ({ params }) => {
    const worker = mockWorkers.find((w) => w.id === Number(params.id));
    if (!worker) {
      return HttpResponse.json(
        {
          status: 404,
          error: "Not Found",
          message: "근로자를 찾을 수 없습니다",
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }
    return HttpResponse.json(worker);
  }),

  http.post(`${BACKEND}/api/workers`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockWorkers[0],
      id: 3,
      name: (body as Record<string, unknown>).name as string,
    });
  }),

  http.get(`${BACKEND}/api/compliance/overdue`, () => HttpResponse.json(mockOverdueDeadlines)),
  http.get(`${BACKEND}/api/compliance/upcoming`, () => HttpResponse.json(mockUpcomingDeadlines)),
  // Next.js Route Handler relative paths (used by React Query hooks in jsdom tests)
  http.get("*/api/compliance/worker/:id", ({ params }) => {
    const deadlines = [...mockOverdueDeadlines, ...mockUpcomingDeadlines].filter(
      (d) => d.workerId === Number(params.id),
    );
    return HttpResponse.json(deadlines);
  }),
  http.get("*/api/compliance/overdue", () => HttpResponse.json(mockOverdueDeadlines)),
  http.get("*/api/compliance/upcoming", () => HttpResponse.json(mockUpcomingDeadlines)),

  http.get(`${BACKEND}/api/compliance/worker/:id`, ({ params }) => {
    const deadlines = [...mockOverdueDeadlines, ...mockUpcomingDeadlines].filter(
      (d) => d.workerId === Number(params.id),
    );
    return HttpResponse.json(deadlines);
  }),

  // Test endpoints (for api-client tests)
  http.get(`${BACKEND}/test`, () => HttpResponse.json({ message: "ok" })),
  http.post(`${BACKEND}/test`, () => HttpResponse.json({ id: 1 })),
  http.put(`${BACKEND}/test/put`, () => HttpResponse.json({ id: 1 })),
  http.get(`${BACKEND}/test/404`, () =>
    HttpResponse.json(
      {
        status: 404,
        error: "Not Found",
        message: "not found",
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    ),
  ),
  http.get(`${BACKEND}/test/500`, () =>
    HttpResponse.json(
      {
        status: 500,
        error: "Internal Server Error",
        message: "server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    ),
  ),
];
