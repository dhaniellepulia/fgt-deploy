import { request, authHeaders } from "./http";

export async function fetchClientProjects(token) {
  return request("/client/projects", { headers: authHeaders(token) });
}

export async function fetchClientProjectById(id, token) {
  return request(`/client/projects/${id}`, { headers: authHeaders(token) });
}

export async function createClientProject(token, payload) {
  return request("/client/projects", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateClientProject(id, token, payload) {
  return request(`/client/projects/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteClientProject(id, token) {
  return request(`/client/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function uploadProjectImage(projectID, token, file) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const url = `${base}/admin/projects/${projectID}/image`;
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // do NOT set Content-Type for FormData
    },
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
