async function apiRequest(url, options = {}) {
  let token = null;

  if (typeof localStorage !== "undefined") {
    const storedUser = localStorage.getItem(
      "novatech_user"
    );

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        token = user.token || null;
      } catch {
        token = null;
      }
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  });

  const contentType =
    response.headers.get("content-type");

  const data = contentType?.includes(
    "application/json"
  )
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data.error || "Ocurrió un error"
    );
  }

  return data;
}

export default apiRequest;