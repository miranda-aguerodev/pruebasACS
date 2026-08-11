import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import apiRequest from "./api";

describe("apiRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("retorna JSON cuando la respuesta es exitosa", async () => {
    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        message: "Solicitud encontrada",
      }),
    });

    const result = await apiRequest("/api/test");

    expect(result).toEqual({
      message: "Solicitud encontrada",
    });
  });

  it("retorna texto cuando la respuesta no es JSON", async () => {
    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "text/plain",
      },
      text: async () => "NovaTech funcionando",
    });

    const result = await apiRequest("/api/test");

    expect(result).toBe("NovaTech funcionando");
  });

  it("lanza el mensaje de error recibido desde la API", async () => {
    fetch.mockResolvedValue({
      ok: false,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        error: "Solicitud no encontrada",
      }),
    });

    await expect(
      apiRequest("/api/solicitudes/999")
    ).rejects.toThrow("Solicitud no encontrada");
  });

  it("usa un mensaje genérico si la API no entrega detalle", async () => {
    fetch.mockResolvedValue({
      ok: false,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({}),
    });

    await expect(
      apiRequest("/api/test")
    ).rejects.toThrow("Ocurrió un error");
  });

  it("envía Content-Type application/json por defecto", async () => {
    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        status: "ok",
      }),
    });

    await apiRequest("/api/test", {
      method: "POST",
      body: JSON.stringify({
        prueba: true,
      }),
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("permite enviar headers adicionales sin perder Content-Type", async () => {
    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        status: "ok",
      }),
    });

    await apiRequest("/api/test", {
      headers: {
        "X-Test": "NovaTech",
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Test": "NovaTech",
        }),
      })
    );
  });
});

it("lanza errores recibidos como texto", async () => {
  fetch.mockResolvedValue({
    ok: false,
    headers: {
      get: () => "text/plain",
    },
    text: async () => "Servicio temporalmente no disponible",
  });

  await expect(
    apiRequest("/api/test")
  ).rejects.toThrow(
    "Servicio temporalmente no disponible"
  );
});