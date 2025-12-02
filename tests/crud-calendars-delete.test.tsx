import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock global fetch
global.fetch = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock useCurrentUserProfile hook
vi.mock("@/app/lib/userState", () => ({
  useCurrentUserProfile: () => ({
    id: "user123",
    role: "admin",
    name: "Test Admin",
  }),
}));

describe("CRUD Calendars - DELETE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("renderiza el componente de control de calendario sin errores", async () => {
    const ControlCalendarioPage = (
      await import("@/app/dashboard/control-calendario/page")
    ).default;
    render(<ControlCalendarioPage />);

    // Wait for the page to render
    await waitFor(() => {
      expect(screen.getByText("Control de calendario")).toBeInTheDocument();
    });

    // Verify the main title is present (confirming component loaded)
    const title = screen.getByText("Control de calendario");
    expect(title).toBeInTheDocument();

    // Verify that the CrudCalendar component is rendered
    // (The calendar component will render with basic UI elements)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
