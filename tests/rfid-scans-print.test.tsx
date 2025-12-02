import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock global fetch
global.fetch = vi.fn();

// Mock window.open and window.print
const mockOpen = vi.fn();
const mockPrint = vi.fn();
Object.defineProperty(window, "open", {
  value: mockOpen,
  writable: true,
});
Object.defineProperty(window, "print", {
  value: mockPrint,
  writable: true,
});

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

describe("RFID Scans - Print", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
    mockOpen.mockReset();
    mockPrint.mockReset();
  });

  it("abre el modal de impresión y permite seleccionar registros", async () => {
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

    // Click "Imprimir Registros" button to open print modal
    const printButton = screen.getByText("Imprimir Registros");
    fireEvent.click(printButton);

    // Verify the print modal opens with correct title
    await waitFor(() => {
      expect(screen.getByText("Imprime los registros de scans")).toBeInTheDocument();
    });

    // Verify the table with scans is displayed in the modal
    expect(screen.getAllByText("ESP32_1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ESP32_2").length).toBeGreaterThan(0);
  });

  it("permite seleccionar registros y habilita el botón de impresión", async () => {
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

    // Open print modal
    fireEvent.click(screen.getByText("Imprimir Registros"));

    await waitFor(() => {
      expect(screen.getByText("Imprime los registros de scans")).toBeInTheDocument();
    });

    // Find and click checkboxes to select scans
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    // Verify print button is enabled after selection
    const printButton = screen.getAllByText("Imprimir Seleccionados")[0];
    await waitFor(() => {
      expect(printButton).not.toBeDisabled();
    });
  });
});
