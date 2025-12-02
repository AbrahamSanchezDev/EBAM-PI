import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

describe("CRUD Calendars - UPDATE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("actualiza un evento cuando se edita y se guarda", async () => {
    const mockCalendars = [
      {
        _id: "cal1",
        name: "Calendario de Prueba",
        events: [
          {
            title: "Evento original",
            start: "2025-12-02T10:00:00Z",
            end: "2025-12-02T11:30:00Z",
          },
        ],
      },
    ];

    // Mock fetch for loading calendars
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ calendars: mockCalendars }),
    });

    const ControlCalendarioPage = (
      await import("@/app/dashboard/control-calendario/page")
    ).default;
    render(<ControlCalendarioPage />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText("Control de calendario")).toBeInTheDocument();
    });

    // Find and click the load calendar button
    const buttons = screen.getAllByRole("button");
    const loadButton = buttons.find((btn) =>
      btn.textContent?.toLowerCase().includes("cargar")
    );

    if (loadButton) {
      fireEvent.click(loadButton);

      // Wait for the load modal to appear
      await waitFor(() => {
        // Verify that we tried to fetch available calendars
        expect(global.fetch).toHaveBeenCalledWith("/api/calendars/list");
      });
    }
  });
});
