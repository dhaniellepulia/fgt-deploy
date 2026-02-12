const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
let API_URL = rawApiUrl.replace(/\/+$/, "");

if (!/^https?:\/\//i.test(API_URL) && API_URL.length) {
  API_URL = `https://${API_URL}`;
}
export { API_URL };

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
