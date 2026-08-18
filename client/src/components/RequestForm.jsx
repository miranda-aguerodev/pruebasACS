import { useState } from "react";

import { CATEGORIES } from "../helpers/constants";

const INITIAL_FORM = {
  descripcion: "",
  ubicacion: "",
  categoria: "",
};

const LIMITS = {
  descripcion: 255,
  ubicacion: 120,
};

export default function RequestForm({
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const success = await onSubmit(form);

    if (success) {
      setForm(INITIAL_FORM);
    }
  }

  return (
    <form
      className="request-form"
      onSubmit={handleSubmit}
    >
      <div className="form-grid">
        <label className="form-field form-field-wide">
          Descripción del problema

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Describa el problema de mantenimiento..."
            rows="4"
            maxLength={LIMITS.descripcion}
            required
          />

          <span className="field-counter">
            {form.descripcion.length}/{LIMITS.descripcion}
          </span>
        </label>

        <label className="form-field">
          Ubicación

          <input
            type="text"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            placeholder="Ej. Aula 203"
            maxLength={LIMITS.ubicacion}
            required
          />

          <span className="field-counter">
            {form.ubicacion.length}/{LIMITS.ubicacion}
          </span>
        </label>

        <label className="form-field">
          Categoría

          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            required
          >
            <option value="">
              Seleccione una categoría
            </option>

            {CATEGORIES.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        className="button button-primary"
        disabled={loading}
      >
        {loading
          ? "Registrando..."
          : "Registrar solicitud"}
      </button>
    </form>
  );
}