const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function api(path, { method = "GET", body } = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || "Erro na requisição");
    error.status = res.status;
    throw error;
  }

  return data;
}