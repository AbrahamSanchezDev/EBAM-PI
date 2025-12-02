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

describe("CRUD Calendars - READ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("carga y muestra la lista de calendarios disponibles", async () => {
    // Mock data for available calendars
    const mockCalendars = [
      {
        _id: "cal1",
        name: "Calendario Académico",
        events: [
          {
            title: "Clase de Matemáticas",
            start: "2025-12-02T10:00:00Z",
            end: "2025-12-02T11:30:00Z",
          },
        ],
      },
      {
        _id: "cal2",
        name: "Calendario de Reuniones",
        events: [
          {
            title: "Reunión con directores",
            start: "2025-12-02T14:00:00Z",
            end: "2025-12-02T15:00:00Z",
          },
        ],
      },
    ];

    // Mock fetch for calendars/list endpoint
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ calendars: mockCalendars }),
    });

    // Import and render the page component
    const ControlCalendarioPage = (
      await import("@/app/dashboard/control-calendario/page")
    ).default;
    render(<ControlCalendarioPage />);

    // Wait for the title to appear
    await waitFor(() => {
      expect(screen.getByText("Control de calendario")).toBeInTheDocument();
    });

    // Verify that CrudCalendar component is rendered
    expect(screen.getByText("Control de calendario")).toBeInTheDocument();
  });
});
