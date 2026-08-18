const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "NovaTech API funcionando",
  });
});

// =============================
// AUTENTICACIÓN
// =============================

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Correo y contraseña son obligatorios",
    });
  }

  const sql = `
    SELECT id, nombre, email, rol
    FROM usuarios
    WHERE email = ? AND password = ?
    LIMIT 1
  `;

  db.query(sql, [email, password], (error, resultados) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }

    if (resultados.length === 0) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos",
      });
    }

    res.json(resultados[0]);
  });
});

// =============================
// TÉCNICOS
// =============================

app.get("/api/tecnicos", (req, res) => {
  const sql = `
    SELECT id, nombre, email
    FROM usuarios
    WHERE rol = 'tecnico'
    ORDER BY nombre
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        error: "Error al consultar técnicos",
      });
    }

    res.json(resultados);
  });
});

// =============================
// SOLICITUDES
// =============================

app.get("/api/solicitudes", (req, res) => {
  const {
    solicitante_id,
    tecnico_id,
    estado,
  } = req.query;

  let sql = `
    SELECT
      s.id,
      s.descripcion,
      s.ubicacion,
      s.categoria,
      s.prioridad,
      s.estado,
      s.solicitante_id,
      s.tecnico_id,
      s.fecha_creacion,

      solicitante.nombre AS solicitante,
      tecnico.nombre AS tecnico

    FROM solicitudes s

    INNER JOIN usuarios solicitante
      ON s.solicitante_id = solicitante.id

    LEFT JOIN usuarios tecnico
      ON s.tecnico_id = tecnico.id

    WHERE 1 = 1
  `;

  const values = [];

  if (solicitante_id) {
    sql += " AND s.solicitante_id = ?";
    values.push(solicitante_id);
  }

  if (tecnico_id) {
    sql += " AND s.tecnico_id = ?";
    values.push(tecnico_id);
  }

  if (estado) {
    sql += " AND s.estado = ?";
    values.push(estado);
  }

  sql += " ORDER BY s.fecha_creacion DESC";

  db.query(sql, values, (error, resultados) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        error: "Error al consultar solicitudes",
      });
    }

    res.json(resultados);
  });
});

// Crear solicitud
app.post("/api/solicitudes", (req, res) => {
  const {
    descripcion,
    ubicacion,
    categoria,
    solicitante_id,
  } = req.body;

  if (
    !descripcion ||
    !ubicacion ||
    !categoria ||
    !solicitante_id
  ) {
    return res.status(400).json({
      error: "Todos los campos son obligatorios",
    });
  }

  if (descripcion.length > 255) {
    return res.status(400).json({
      error:
        "La descripción no puede superar los 255 caracteres",
    });
  }

  if (ubicacion.length > 120) {
    return res.status(400).json({
      error:
        "La ubicación no puede superar los 120 caracteres",
    });
  }

  const sql = `
    INSERT INTO solicitudes
      (
        descripcion,
        ubicacion,
        categoria,
        solicitante_id
      )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      descripcion,
      ubicacion,
      categoria,
      solicitante_id,
    ],
    (error, result) => {
      if (error) {
        console.error(
          "Error al registrar solicitud:",
          error
        );

        return res.status(500).json({
          error: "Error al registrar la solicitud",
        });
      }

      const solicitudId = result.insertId;

      const historySql = `
        INSERT INTO historial_solicitudes
          (
            solicitud_id,
            usuario_id,
            tipo,
            descripcion
          )
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        historySql,
        [
          solicitudId,
          solicitante_id,
          "creacion",
          "Solicitud creada",
        ],
        (historyError) => {
          if (historyError) {
            console.error(
              "Error al registrar historial:",
              historyError
            );
          }
        }
      );

      res.status(201).json({
        message:
          "Solicitud registrada correctamente",
        id: solicitudId,
      });
    }
  );
});

// Actualizar prioridad, estado o técnico
app.put("/api/solicitudes/:id", (req, res) => {
  const solicitudId = req.params.id;

  const {
    prioridad,
    estado,
    tecnico_id,
    usuario_id,
    motivo_cierre,
    solicitud_relacionada_id,
  } = req.body;

  const currentSql = `
    SELECT
      id,
      prioridad,
      estado,
      tecnico_id
    FROM solicitudes
    WHERE id = ?
  `;

  db.query(
    currentSql,
    [solicitudId],
    (currentError, currentResults) => {
      if (currentError) {
        console.error(currentError);

        return res.status(500).json({
          error: "Error al consultar la solicitud",
        });
      }

      if (currentResults.length === 0) {
        return res.status(404).json({
          error: "Solicitud no encontrada",
        });
      }

      const current = currentResults[0];

      // Una solicitud cerrada queda bloqueada.
      if (current.estado === "cerrada") {
        return res.status(400).json({
          error:
            "Una solicitud cerrada no puede modificarse",
        });
      }

      const effectiveTechnician =
        tecnico_id !== undefined
          ? tecnico_id
          : current.tecnico_id;

      const normalizedCloseReason =
        typeof motivo_cierre === "string"
          ? motivo_cierre.trim()
          : "";

      /*
       * Transiciones permitidas:
       *
       * pendiente  -> en_proceso
       * pendiente  -> cerrada
       *               solo cierre administrativo justificado
       *
       * en_proceso -> finalizada
       *
       * finalizada -> en_proceso
       *               reapertura
       *
       * finalizada -> cerrada
       */
      const allowedTransitions = {
        pendiente: ["en_proceso", "cerrada"],
        en_proceso: ["finalizada"],
        finalizada: ["en_proceso", "cerrada"],
        cerrada: [],
      };

      if (
        estado !== undefined &&
        estado !== current.estado
      ) {
        const allowed =
          allowedTransitions[current.estado] || [];

        if (!allowed.includes(estado)) {
          return res.status(400).json({
            error:
              `Transición de estado no permitida: ` +
              `${current.estado} → ${estado}`,
          });
        }

        // Pendiente -> Cerrada requiere justificación.
        if (
          current.estado === "pendiente" &&
          estado === "cerrada" &&
          !normalizedCloseReason
        ) {
          return res.status(400).json({
            error:
              "Debe indicar el motivo para cerrar una solicitud pendiente",
          });
        }

        // Para comenzar o finalizar trabajo se requiere técnico.
        if (
          ["en_proceso", "finalizada"].includes(estado) &&
          (
            effectiveTechnician === null ||
            effectiveTechnician === "" ||
            effectiveTechnician === undefined
          )
        ) {
          return res.status(400).json({
            error:
              "Debe asignar un técnico antes de cambiar la solicitud a ese estado",
          });
        }
      }

      function continueUpdate() {
        const fields = [];
        const values = [];

        if (prioridad !== undefined) {
          fields.push("prioridad = ?");
          values.push(prioridad);
        }

        if (estado !== undefined) {
          fields.push("estado = ?");
          values.push(estado);
        }

        if (tecnico_id !== undefined) {
          fields.push("tecnico_id = ?");
          values.push(
            tecnico_id === "" ? null : tecnico_id
          );
        }

        if (fields.length === 0) {
          return res.status(400).json({
            error: "No hay datos para actualizar",
          });
        }

        values.push(solicitudId);

        const updateSql = `
          UPDATE solicitudes
          SET ${fields.join(", ")}
          WHERE id = ?
        `;

        db.query(
          updateSql,
          values,
          (updateError, updateResult) => {
            if (updateError) {
              console.error(updateError);

              return res.status(500).json({
                error:
                  "Error al actualizar la solicitud",
              });
            }

            if (updateResult.affectedRows === 0) {
              return res.status(404).json({
                error: "Solicitud no encontrada",
              });
            }

            const events = [];

            if (
              prioridad !== undefined &&
              prioridad !== current.prioridad
            ) {
              events.push(
                `Prioridad cambiada de ${current.prioridad} a ${prioridad}`
              );
            }

            if (
              tecnico_id !== undefined &&
              Number(tecnico_id) !==
                Number(current.tecnico_id)
            ) {
              if (
                tecnico_id === null ||
                tecnico_id === ""
              ) {
                events.push("Técnico desasignado");
              } else if (!current.tecnico_id) {
                events.push("Técnico asignado");
              } else {
                events.push("Técnico reasignado");
              }
            }

            if (
              estado !== undefined &&
              estado !== current.estado
            ) {
              // Cierre administrativo desde Pendiente.
              if (
                current.estado === "pendiente" &&
                estado === "cerrada"
              ) {
                let description =
                  `Solicitud cerrada. Motivo: ${normalizedCloseReason}`;

                if (
                  normalizedCloseReason ===
                    "Solicitud duplicada" &&
                  solicitud_relacionada_id
                ) {
                  description +=
                    `. Caso relacionado: Solicitud #${solicitud_relacionada_id}`;
                }

                events.push(description);
              }

              // Cierre normal.
              else if (estado === "cerrada") {
                events.push("Solicitud cerrada");
              }

              // Reapertura.
              else if (
                current.estado === "finalizada" &&
                estado === "en_proceso"
              ) {
                events.push("Solicitud reabierta");
              }

              // Cambio normal.
              else {
                events.push(
                  `Estado cambiado de ${current.estado} a ${estado}`
                );
              }
            }

            if (events.length === 0) {
              return res.json({
                message:
                  "Solicitud actualizada correctamente",
              });
            }

            const historySql = `
              INSERT INTO historial_solicitudes
                (
                  solicitud_id,
                  usuario_id,
                  tipo,
                  descripcion
                )
              VALUES (?, ?, ?, ?)
            `;

            let pending = events.length;

            events.forEach((description) => {
              db.query(
                historySql,
                [
                  solicitudId,
                  usuario_id || null,
                  "cambio",
                  description,
                ],
                (historyError) => {
                  if (historyError) {
                    console.error(
                      "Error registrando historial:",
                      historyError
                    );
                  }

                  pending -= 1;

                  if (pending === 0) {
                    res.json({
                      message:
                        "Solicitud actualizada correctamente",
                    });
                  }
                }
              );
            });
          }
        );
      }

      // Si se cierra como duplicada,
      // la solicitud relacionada debe existir.
      if (
        current.estado === "pendiente" &&
        estado === "cerrada" &&
        normalizedCloseReason === "Solicitud duplicada"
      ) {
        if (!solicitud_relacionada_id) {
          return res.status(400).json({
            error:
              "Debe indicar la solicitud relacionada",
          });
        }

        // No puede relacionarse consigo misma.
        if (
          Number(solicitud_relacionada_id) ===
          Number(solicitudId)
        ) {
          return res.status(400).json({
            error:
              "Una solicitud no puede relacionarse consigo misma",
          });
        }

        const relatedSql = `
          SELECT id
          FROM solicitudes
          WHERE id = ?
          LIMIT 1
        `;

        return db.query(
          relatedSql,
          [solicitud_relacionada_id],
          (relatedError, relatedResults) => {
            if (relatedError) {
              console.error(relatedError);

              return res.status(500).json({
                error:
                  "Error al validar la solicitud relacionada",
              });
            }

            if (relatedResults.length === 0) {
              return res.status(400).json({
                error:
                  "La solicitud relacionada no existe",
              });
            }

            return continueUpdate();
          }
        );
      }

      return continueUpdate();
    }
  );
});

// =============================
// COMENTARIOS
// =============================

app.get(
  "/api/solicitudes/:id/comentarios",
  (req, res) => {
    const { id } = req.params;

    const sql = `
      SELECT
        c.id,
        c.comentario,
        c.fecha,
        c.usuario_id,
        u.nombre,
        u.rol
      FROM comentarios c
      INNER JOIN usuarios u
        ON c.usuario_id = u.id
      WHERE c.solicitud_id = ?
      ORDER BY c.fecha ASC
    `;

    db.query(sql, [id], (error, resultados) => {
      if (error) {
        console.error(error);

        return res.status(500).json({
          error: "Error al consultar comentarios",
        });
      }

      res.json(resultados);
    });
  }
);

app.post(
  "/api/solicitudes/:id/comentarios",
  (req, res) => {
    const { id } = req.params;

    const {
      usuario_id,
      comentario,
    } = req.body;

    if (!usuario_id || !comentario?.trim()) {
      return res.status(400).json({
        error: "Usuario y comentario son obligatorios",
      });
    }

    const sql = `
      INSERT INTO comentarios
        (
          solicitud_id,
          usuario_id,
          comentario
        )
      VALUES (?, ?, ?)
    `;

    db.query(
      sql,
      [
        id,
        usuario_id,
        comentario.trim(),
      ],
      (error, resultado) => {
        if (error) {
          console.error(error);

          return res.status(500).json({
            error: "Error al registrar comentario",
          });
        }

        res.status(201).json({
          message: "Comentario registrado",
          id: resultado.insertId,
        });
      }
    );
  }
);

// =============================
// HISTORIAL
// =============================

app.get(
  "/api/solicitudes/:id/historial",
  (req, res) => {
    const solicitudId = req.params.id;

    const sql = `
      SELECT
        h.id,
        h.descripcion AS contenido,
        h.tipo,
        h.fecha,
        u.nombre,
        u.rol,
        'evento' AS origen
      FROM historial_solicitudes h
      LEFT JOIN usuarios u
        ON h.usuario_id = u.id
      WHERE h.solicitud_id = ?

      UNION ALL

      SELECT
        c.id,
        c.comentario AS contenido,
        'comentario' AS tipo,
        c.fecha,
        u.nombre,
        u.rol,
        'comentario' AS origen
      FROM comentarios c
      INNER JOIN usuarios u
        ON c.usuario_id = u.id
      WHERE c.solicitud_id = ?

      ORDER BY fecha ASC
    `;

    db.query(
      sql,
      [solicitudId, solicitudId],
      (error, results) => {
        if (error) {
          console.error(error);

          return res.status(500).json({
            error: "Error al obtener el historial",
          });
        }

        res.json(results);
      }
    );
  }
);

// =============================
// SERVIDOR
// =============================

app.listen(PORT, () => {
  console.log(
    `NovaTech API ejecutándose en http://localhost:${PORT}`
  );
});