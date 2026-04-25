import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SyncStatus } from "@/components/legal/sync-status";

describe("SyncStatus", () => {
  it("렌더링하지_않는다", () => {
    const { container } = render(<SyncStatus />);
    expect(container.innerHTML).toBe("");
  });
});
