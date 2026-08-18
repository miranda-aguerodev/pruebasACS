import apiRequest from "./api";

export function getRequests(filters = {}) {
  const params = new URLSearchParams(filters);

  const query = params.toString();

  return apiRequest(
    `/api/solicitudes${query ? `?${query}` : ""}`
  );
}

export function createRequest(data) {
  return apiRequest("/api/solicitudes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRequest(id, data) {
  return apiRequest(`/api/solicitudes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getTechnicians() {
  return apiRequest("/api/tecnicos");
}

export function addComment(id, data) {
  return apiRequest(`/api/solicitudes/${id}/comentarios`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getComments(id) {
  return apiRequest(`/api/solicitudes/${id}/comentarios`);
}

export function getHistory(id) {
  return apiRequest(`/api/solicitudes/${id}/historial`);
}

// =============================
// GESTIÓN DE USUARIOS
// HU-02
// =============================

export function getUsers() {
  return apiRequest("/api/usuarios");
}

export function createUser(data) {
  return apiRequest("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(id, data) {
  return apiRequest(`/api/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}