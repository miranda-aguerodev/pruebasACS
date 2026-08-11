export const ROLES = {
  ADMIN: "administrador",
  TECHNICIAN: "tecnico",
  REQUESTER: "solicitante",
};

export const ROLE_ROUTES = {
  administrador: "/admin",
  tecnico: "/tecnico",
  solicitante: "/solicitante",
};

export const PRIORITIES = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export const STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "finalizada", label: "Finalizada" },
  { value: "cerrada", label: "Cerrada" },
];

export const CATEGORIES = [
  "Electricidad",
  "Climatización",
  "Tecnología",
  "Plomería",
  "Mobiliario",
  "Otro",
];