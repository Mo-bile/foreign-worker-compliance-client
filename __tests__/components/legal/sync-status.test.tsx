import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SyncStatus } from "@/components/legal/sync-status";

describe("SyncStatus", () => {
  it("renders formatted sync date", () => {
    render(<SyncStatus lastSyncedAt="2026-03-24T06:00:00+09:00" />);
    expect(screen.getByText(/법제처 API 마지막 동기화/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
