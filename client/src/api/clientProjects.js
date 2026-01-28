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
