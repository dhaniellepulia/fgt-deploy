import { request, authHeaders } from "./http";

export async function fetchProjects(token) {
  return request("/projects", { headers: authHeaders(token) });
}

export async function fetchProjectById(id, token) {
  return request(`/projects/${id}`, { headers: authHeaders(token) });
}

export async function fetchClientProjects(token) {
  return request("/client/projects", { headers: authHeaders(token) });
}
