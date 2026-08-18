require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET no está configurado en el archivo .env"
  );
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// AUTENTICACIÓN JWT
// =============================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token =
    authHeader &&
    authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  if (!token) {
    return res.status(401).json({
      error: "Autenticación requerida",
    });
  }

  jwt.verify(
    token,
    JWT_SECRET,
    {
      algorithms: ["HS256"],
    },
    (error, decoded) => {
      if (error) {
        return res.status(403).json({
          error: "Token inválido o expirado",
        });
      }

      req.user = decoded;
      next();
    }
  );
}

function getRequestForAuthorization(
  solicitudId,
  callback
) {
  const sql = `
    SELECT
      id,
      solicitante_id,
      tecnico_id,
      estado
    FROM solicitudes
    WHERE id = ?
    LIMIT 1
  `;

  db.query(sql, [solicitudId], (error, results) => {
    if (error) {
      return callback(error);
    }

    callback(null, results[0] || null);
  });
}

function canAccessRequest(user, request) {
  if (user.rol === "administrador") {
    return true;
  }

  if (user.rol === "solicitante") {
    return (
      Number(request.solicitante_id) ===
      Number(user.id)
    );
  }

  if (user.rol === "tecnico") {
    return (
      Number(request.tecnico_id) ===
      Number(user.id)
    );
  }

  return false;
}

// =============================
// HEALTH CHECK
// PÚBLICO
// =============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "NovaTech API funcionando",
  });
});

// =============================
// LOGIN
// PÚBLICO
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

  db.query(
    sql,
    [email, password],
    (error, resultados) => {
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

      const user = resultados[0];

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: user.rol,
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "8h",
        }
      );

      res.json({
        ...user,
        token,
      });
    }
  );
});

// =============================
// PROTECCIÓN GLOBAL
// =============================

app.use("/api", authenticateToken);

// =============================
// TÉCNICOS
// Solo Administrador
// =============================

app.get("/api/tecnicos", (req, res) => {
  if (req.user.rol !== "administrador") {
    return res.status(403).json({
      error:
        "No tiene permisos para consultar técnicos",
    });
  }

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

// Consultar solicitudes
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

  if (req.user.rol === "solicitante") {
    sql += " AND s.solicitante_id = ?";
    values.push(req.user.id);
  } else if (req.user.rol === "tecnico") {
    sql += " AND s.tecnico_id = ?";
    values.push(req.user.id);
  } else if (req.user.rol === "administrador") {
    if (solicitante_id) {
      sql += " AND s.solicitante_id = ?";
      values.push(solicitante_id);
    }

    if (tecnico_id) {
      sql += " AND s.tecnico_id = ?";
      values.push(tecnico_id);
    }
  } else {
    return res.status(403).json({
      error: "Rol no autorizado",
    });
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
// Solo Solicitante
app.post("/api/solicitudes", (req, res) => {
  if (req.user.rol !== "solicitante") {
    return res.status(403).json({
      error:
        "Solo un solicitante puede registrar solicitudes",
    });
  }

  const {
    descripcion,
    ubicacion,
    categoria,
  } = req.body;

  if (
    !descripcion ||
    !ubicacion ||
    !categoria
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

  const solicitanteId = req.user.id;

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
      solicitanteId,
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
          solicitanteId,
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
    motivo_cierre,
    solicitud_relacionada_id,
    observacion_final,
  } = req.body;

  const currentSql = `
    SELECT
      id,
      prioridad,
      estado,
      tecnico_id,
      solicitante_id
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

      // =========================
      // AUTORIZACIÓN POR ROL
      // =========================

      if (req.user.rol === "solicitante") {
        return res.status(403).json({
          error:
            "El solicitante no puede modificar solicitudes",
        });
      }

      if (req.user.rol === "tecnico") {
        if (
          Number(current.tecnico_id) !==
          Number(req.user.id)
        ) {
          return res.status(403).json({
            error:
              "No tiene permiso para modificar esta solicitud",
          });
        }

        if (
          prioridad !== undefined ||
          tecnico_id !== undefined ||
          motivo_cierre !== undefined ||
          solicitud_relacionada_id !== undefined ||
          observacion_final !== undefined
        ) {
          return res.status(403).json({
            error:
              "El técnico solo puede actualizar el estado de sus solicitudes",
          });
        }

        const technicianTransitions = {
          pendiente: ["en_proceso"],
          en_proceso: ["finalizada"],
          finalizada: [],
          cerrada: [],
        };

        if (
          estado === undefined ||
          !technicianTransitions[
            current.estado
          ]?.includes(estado)
        ) {
          return res.status(403).json({
            error:
              "Transición no permitida para el técnico",
          });
        }
      }

      if (
        ![
          "administrador",
          "tecnico",
        ].includes(req.user.rol)
      ) {
        return res.status(403).json({
          error: "Rol no autorizado",
        });
      }

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

      const normalizedFinalObservation =
        typeof observacion_final === "string"
          ? observacion_final.trim()
          : "";

      // =========================
      // REGLAS DEL ADMINISTRADOR
      // =========================

      if (req.user.rol === "administrador") {
        const allowedTransitions = {
          pendiente: [
            "en_proceso",
            "cerrada",
          ],
          en_proceso: ["finalizada"],
          finalizada: [
            "en_proceso",
            "cerrada",
          ],
          cerrada: [],
        };

        if (
          estado !== undefined &&
          estado !== current.estado
        ) {
          const allowed =
            allowedTransitions[
              current.estado
            ] || [];

          if (!allowed.includes(estado)) {
            return res.status(400).json({
              error:
                `Transición de estado no permitida: ` +
                `${current.estado} → ${estado}`,
            });
          }

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

          // HU-10:
          // El cierre normal de una solicitud finalizada
          // requiere una observación final.
          if (
            current.estado === "finalizada" &&
            estado === "cerrada" &&
            !normalizedFinalObservation
          ) {
            return res.status(400).json({
              error:
                "Debe indicar una observación final antes de cerrar la solicitud",
            });
          }

          if (
            ["en_proceso", "finalizada"].includes(
              estado
            ) &&
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
      }

      function continueUpdate() {
        const fields = [];
        const values = [];

        if (
          req.user.rol === "administrador" &&
          prioridad !== undefined
        ) {
          fields.push("prioridad = ?");
          values.push(prioridad);
        }

        if (estado !== undefined) {
          fields.push("estado = ?");
          values.push(estado);
        }

        if (
          req.user.rol === "administrador" &&
          tecnico_id !== undefined
        ) {
          fields.push("tecnico_id = ?");
          values.push(
            tecnico_id === ""
              ? null
              : tecnico_id
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
                error:
                  "Solicitud no encontrada",
              });
            }

            const events = [];

            if (
              req.user.rol === "administrador" &&
              prioridad !== undefined &&
              prioridad !== current.prioridad
            ) {
              events.push(
                `Prioridad cambiada de ${current.prioridad} a ${prioridad}`
              );
            }

            if (
              req.user.rol === "administrador" &&
              tecnico_id !== undefined &&
              Number(tecnico_id) !==
                Number(current.tecnico_id)
            ) {
              if (
                tecnico_id === null ||
                tecnico_id === ""
              ) {
                events.push(
                  "Técnico desasignado"
                );
              } else if (!current.tecnico_id) {
                events.push(
                  "Técnico asignado"
                );
              } else {
                events.push(
                  "Técnico reasignado"
                );
              }
            }

            if (
              estado !== undefined &&
              estado !== current.estado
            ) {
              if (
                req.user.rol ===
                  "administrador" &&
                current.estado ===
                  "pendiente" &&
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
              } else if (
                req.user.rol ===
                  "administrador" &&
                current.estado ===
                  "finalizada" &&
                estado === "cerrada"
              ) {
                events.push(
                  `Solicitud cerrada. Observación final: ${normalizedFinalObservation}`
                );
              } else if (
                current.estado ===
                  "finalizada" &&
                estado === "en_proceso"
              ) {
                events.push(
                  "Solicitud reabierta"
                );
              } else {
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

            events.forEach(
              (description) => {
                db.query(
                  historySql,
                  [
                    solicitudId,
                    req.user.id,
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
              }
            );
          }
        );
      }

      // =========================
      // VALIDAR DUPLICADO
      // Solo Administrador
      // =========================

      if (
        req.user.rol === "administrador" &&
        current.estado === "pendiente" &&
        estado === "cerrada" &&
        normalizedCloseReason ===
          "Solicitud duplicada"
      ) {
        if (!solicitud_relacionada_id) {
          return res.status(400).json({
            error:
              "Debe indicar la solicitud relacionada",
          });
        }

        if (
          Number(
            solicitud_relacionada_id
          ) === Number(solicitudId)
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
          (
            relatedError,
            relatedResults
          ) => {
            if (relatedError) {
              console.error(
                relatedError
              );

              return res.status(500).json({
                error:
                  "Error al validar la solicitud relacionada",
              });
            }

            if (
              relatedResults.length === 0
            ) {
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

// Consultar comentarios
app.get(
  "/api/solicitudes/:id/comentarios",
  (req, res) => {
    const solicitudId = req.params.id;

    getRequestForAuthorization(
      solicitudId,
      (accessError, request) => {
        if (accessError) {
          console.error(accessError);

          return res.status(500).json({
            error:
              "Error al validar la solicitud",
          });
        }

        if (!request) {
          return res.status(404).json({
            error:
              "Solicitud no encontrada",
          });
        }

        if (
          !canAccessRequest(
            req.user,
            request
          )
        ) {
          return res.status(403).json({
            error:
              "No tiene permiso para consultar esta solicitud",
          });
        }

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

        db.query(
          sql,
          [solicitudId],
          (error, resultados) => {
            if (error) {
              console.error(error);

              return res.status(500).json({
                error:
                  "Error al consultar comentarios",
              });
            }

            res.json(resultados);
          }
        );
      }
    );
  }
);

// Agregar comentario
// Solo Técnico asignado
app.post(
  "/api/solicitudes/:id/comentarios",
  (req, res) => {
    const solicitudId = req.params.id;
    const { comentario } = req.body;

    if (req.user.rol !== "tecnico") {
      return res.status(403).json({
        error:
          "Solo el técnico asignado puede registrar comentarios",
      });
    }

    if (!comentario?.trim()) {
      return res.status(400).json({
        error:
          "El comentario es obligatorio",
      });
    }

    getRequestForAuthorization(
      solicitudId,
      (accessError, request) => {
        if (accessError) {
          console.error(accessError);

          return res.status(500).json({
            error:
              "Error al validar la solicitud",
          });
        }

        if (!request) {
          return res.status(404).json({
            error:
              "Solicitud no encontrada",
          });
        }

        if (
          Number(request.tecnico_id) !==
          Number(req.user.id)
        ) {
          return res.status(403).json({
            error:
              "No tiene permiso para comentar esta solicitud",
          });
        }

        if (
          ["finalizada", "cerrada"].includes(
            request.estado
          )
        ) {
          return res.status(400).json({
            error:
              "No se pueden agregar comentarios a una solicitud finalizada o cerrada",
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
            solicitudId,
            req.user.id,
            comentario.trim(),
          ],
          (error, resultado) => {
            if (error) {
              console.error(error);

              return res.status(500).json({
                error:
                  "Error al registrar comentario",
              });
            }

            res.status(201).json({
              message:
                "Comentario registrado",
              id: resultado.insertId,
            });
          }
        );
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

    getRequestForAuthorization(
      solicitudId,
      (accessError, request) => {
        if (accessError) {
          console.error(accessError);

          return res.status(500).json({
            error:
              "Error al validar la solicitud",
          });
        }

        if (!request) {
          return res.status(404).json({
            error:
              "Solicitud no encontrada",
          });
        }

        if (
          !canAccessRequest(
            req.user,
            request
          )
        ) {
          return res.status(403).json({
            error:
              "No tiene permiso para consultar esta solicitud",
          });
        }

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
          [
            solicitudId,
            solicitudId,
          ],
          (error, results) => {
            if (error) {
              console.error(error);

              return res.status(500).json({
                error:
                  "Error al obtener el historial",
              });
            }

            res.json(results);
          }
        );
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