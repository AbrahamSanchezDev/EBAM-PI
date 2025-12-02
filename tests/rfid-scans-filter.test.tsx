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

describe("RFID Scans - Filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("filtra registros por UID y muestra solo los coincidentes", async () => {
    // Mock data with multiple scans
    const mockScans = [
      {
        device_id: "ESP32_1",
        uid: "7A3B8C2D",
        timestamp: "2025-12-02T10:00:00Z",
      },
      {
        device_id: "ESP32_2",
        uid: "4E5F6G7H",
        timestamp: "2025-12-02T09:30:00Z",
      },
      {
        device_id: "ESP32_1",
        uid: "1K2L3M4N",
        timestamp: "2025-12-02T09:00:00Z",
      },
      {
        device_id: "ESP32_3",
        uid: "7A3B8C2D",
        timestamp: "2025-12-02T08:30:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockScans,
    });

    const ScansPage = (
      await import("@/app/dashboard/scans/page")
    ).default;
    render(<ScansPage />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText("Registros de Scans")).toBeInTheDocument();
    });

    // Find the search input and type a UID
    const searchInput = screen.getByPlaceholderText("Buscar por UID...");
    fireEvent.change(searchInput, { target: { value: "7A3B8C2D" } });

    // Verify that only scans with this UID are visible
    await waitFor(() => {
      expect(screen.getAllByText("7A3B8C2D").length).toBeGreaterThanOrEqual(1);
    });

    // Verify that other UIDs are not visible
    expect(screen.queryByText("4E5F6G7H")).not.toBeInTheDocument();
    expect(screen.queryByText("1K2L3M4N")).not.toBeInTheDocument();
  });

  it("muestra todos los registros nuevamente cuando se limpia la búsqueda", async () => {
    const mockScans = [
      {
        device_id: "ESP32_1",
        uid: "7A3B8C2D",
        timestamp: "2025-12-02T10:00:00Z",
      },
      {
        device_id: "ESP32_2",
        uid: "4E5F6G7H",
        timestamp: "2025-12-02T09:30:00Z",
      },
      {
        device_id: "ESP32_1",
        uid: "1K2L3M4N",
        timestamp: "2025-12-02T09:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockScans,
    });

    const ScansPage = (
      await import("@/app/dashboard/scans/page")
    ).default;
    render(<ScansPage />);

    await waitFor(() => {
      expect(screen.getByText("Registros de Scans")).toBeInTheDocument();
    });

    // Search for a specific UID
    const searchInput = screen.getByPlaceholderText("Buscar por UID...");
    fireEvent.change(searchInput, { target: { value: "7A3B8C2D" } });

    // Verify filtered result
    await waitFor(() => {
      expect(screen.getAllByText("7A3B8C2D")).toHaveLength(1);
    });

    // Click "Mostrar todos" button to clear search
    const clearButton = screen.getByText("Mostrar todos");
    fireEvent.click(clearButton);

    // Verify all scans are shown again
    await waitFor(() => {
      expect(screen.getByText("4E5F6G7H")).toBeInTheDocument();
      expect(screen.getByText("1K2L3M4N")).toBeInTheDocument();
    });
  });
});
