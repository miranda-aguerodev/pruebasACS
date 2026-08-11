import { describe, expect, it } from "vitest";

import {
  formatPriority,
  formatStatus,
} from "./formatters";

describe("formatStatus", () => {
  it("convierte pendiente a Pendiente", () => {
    expect(formatStatus("pendiente")).toBe("Pendiente");
  });

  it("convierte en_proceso a En Proceso", () => {
    expect(formatStatus("en_proceso")).toBe("En Proceso");
  });

  it("convierte finalizada a Finalizada", () => {
    expect(formatStatus("finalizada")).toBe("Finalizada");
  });

  it("maneja un valor vacío", () => {
    expect(formatStatus("")).toBe("");
  });
});

describe("formatPriority", () => {
  it("convierte alta a Alta", () => {
    expect(formatPriority("alta")).toBe("Alta");
  });

  it("convierte critica a Critica", () => {
    expect(formatPriority("critica")).toBe("Critica");
  });

  it("maneja un valor vacío", () => {
    expect(formatPriority("")).toBe("");
  });
});