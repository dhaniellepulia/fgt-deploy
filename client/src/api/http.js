const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const API_URL = rawApiUrl.replace(/\/+$/, ""); // remove trailing slash

function buildUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${p}`;
}

export async function request(path, options = {}) {
  const res = await fetch(buildUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body;
}

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
