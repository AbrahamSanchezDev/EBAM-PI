import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

describe("RFID Scans - Read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("carga y muestra la lista de registros de scans desde la API", async () => {
    // Mock data
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

    // Mock fetch to return successful response with scans
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockScans,
    });

    // Import and render component dynamically to ensure mocks are in place
    const ScansPage = (
      await import("@/app/dashboard/scans/page")
    ).default;
    render(<ScansPage />);

    // Wait for the component to fetch and display data
    await waitFor(() => {
      expect(screen.getByText("Registros de Scans")).toBeInTheDocument();
    });

    // Verify fetch was called with correct endpoint
    expect(global.fetch).toHaveBeenCalledWith("/api/scans");

    // Verify scan data is rendered in the table
    await waitFor(() => {
      expect(screen.getAllByText("ESP32_1").length).toBeGreaterThan(0);
      expect(screen.getAllByText("ESP32_2").length).toBeGreaterThan(0);
      expect(screen.getAllByText("7A3B8C2D").length).toBeGreaterThan(0);
      expect(screen.getAllByText("4E5F6G7H").length).toBeGreaterThan(0);
    });
  });

  it("busca registros por UID y muestra solo los coincidentes", async () => {
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
    fireEvent.change(searchInput, { target: { value: "1K2L3M4N" } });

    // Verify that only scans with this UID are visible
    await waitFor(() => {
      expect(screen.getAllByText("1K2L3M4N").length).toBeGreaterThanOrEqual(1);
    });

    // Verify that other UIDs are not visible
    expect(screen.queryByText("7A3B8C2D")).not.toBeInTheDocument();
    expect(screen.queryByText("4E5F6G7H")).not.toBeInTheDocument();
  });
});
