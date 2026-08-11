import apiRequest from "./api";

export function login(email, password) {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}