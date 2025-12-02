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

// Mock window.alert
const mockAlert = vi.fn();
window.alert = mockAlert;

describe("RFID Scans - Debug Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
    mockAlert.mockReset();
  });

  it("abre el modal de debugeo y muestra las opciones de prueba", async () => {
    const mockScans = [
      {
        device_id: "ESP32_1",
        uid: "7A3B8C2D",
        timestamp: "2025-12-02T10:00:00Z",
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

    // Click Debugeo button
    const debugButton = screen.getByText("Debugeo");
    fireEvent.click(debugButton);

    // Verify debug modal opens
    await waitFor(() => {
      expect(
        screen.getByText("Herramientas de prueba para RFID y usuarios")
      ).toBeInTheDocument();
    });

    // Verify debug buttons are present
    expect(screen.getByText("Ejecutar Prueba RFID")).toBeInTheDocument();
    expect(screen.getByText("Crear Usuarios de Prueba")).toBeInTheDocument();
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("ejecuta la prueba RFID cuando se hace clic en 'Ejecutar Prueba RFID'", async () => {
    const mockScans = [
      {
        device_id: "ESP32_1",
        uid: "7A3B8C2D",
        timestamp: "2025-12-02T10:00:00Z",
      },
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScans,
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ status: "success" }),
      });

    const ScansPage = (
      await import("@/app/dashboard/scans/page")
    ).default;
    render(<ScansPage />);

    await waitFor(() => {
      expect(screen.getByText("Registros de Scans")).toBeInTheDocument();
    });

    // Open debug modal
    fireEvent.click(screen.getByText("Debugeo"));

    await waitFor(() => {
      expect(screen.getByText("Ejecutar Prueba RFID")).toBeInTheDocument();
    });

    // Click "Ejecutar Prueba RFID"
    fireEvent.click(screen.getByText("Ejecutar Prueba RFID"));

    // Verify fetch was called to /api/rfid endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/rfid",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    // Verify completion alert
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining("Prueba completada")
      );
    });
  });

  it("crea usuarios de prueba cuando se hace clic en 'Crear Usuarios de Prueba'", async () => {
    const mockScans = [
      {
        device_id: "ESP32_1",
        uid: "7A3B8C2D",
        timestamp: "2025-12-02T10:00:00Z",
      },
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScans,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Usuarios creados exitosamente" }),
      });

    const ScansPage = (
      await import("@/app/dashboard/scans/page")
    ).default;
    render(<ScansPage />);

    await waitFor(() => {
      expect(screen.getByText("Registros de Scans")).toBeInTheDocument();
    });

    // Open debug modal
    fireEvent.click(screen.getByText("Debugeo"));

    await waitFor(() => {
      expect(screen.getByText("Crear Usuarios de Prueba")).toBeInTheDocument();
    });

    // Click "Crear Usuarios de Prueba"
    fireEvent.click(screen.getByText("Crear Usuarios de Prueba"));

    // Verify fetch was called to /api/create-users endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/create-users",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    // Verify success alert
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining("Usuarios creados exitosamente")
      );
    });
  });

  it("cierra el modal cuando se hace clic en 'Cerrar'", async () => {
    const mockScans = [
      {
        device_id: "ESP32_1",
        uid: "7A3B8C2D",
        timestamp: "2025-12-02T10:00:00Z",
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

    // Open debug modal
    fireEvent.click(screen.getByText("Debugeo"));

    await waitFor(() => {
      expect(screen.getByText("Herramientas de prueba para RFID y usuarios")).toBeInTheDocument();
    });

    // Click "Cerrar"
    const closeButtons = screen.getAllByText("Cerrar");
    fireEvent.click(closeButtons[0]);

    // Verify modal is closed (text should not be visible)
    await waitFor(() => {
      expect(
        screen.queryByText("Herramientas de prueba para RFID y usuarios")
      ).not.toBeInTheDocument();
    });
  });
});
