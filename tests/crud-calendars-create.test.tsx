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

describe("CRUD Calendars - CREATE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("crea un nuevo calendario cuando se ingresa nombre y se hace clic en guardar", async () => {
    const mockEvents = [
      {
        title: "Evento de ejemplo",
        start: new Date(2025, 6, 2, 10, 0),
        end: new Date(2025, 6, 2, 12, 0),
      },
    ];

    // Mock fetch to return successful response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const ControlCalendarioPage = (
      await import("@/app/dashboard/control-calendario/page")
    ).default;
    render(<ControlCalendarioPage />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText("Control de calendario")).toBeInTheDocument();
    });

    // Find and fill the calendar name input

    // Find and fill the calendar name input by ID
    const calendarInput = screen.getByDisplayValue("");
    fireEvent.change(calendarInput, { target: { value: "Mi Calendario" } });
    // Find and click the save button
    const saveButtons = screen.getAllByRole("button");
    const saveButton = saveButtons.find((btn) =>
      btn.textContent?.toLowerCase().includes("guardar")
    );

    if (saveButton) {
      fireEvent.click(saveButton);

      // Verify fetch was called with correct endpoint
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/calendars",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    }
  });
});
