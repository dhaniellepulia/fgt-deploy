import { request, authHeaders } from "./http";

export async function fetchProjects(token) {
  return request("/projects", { headers: authHeaders(token) });
}

export async function fetchProjectById(id, token) {
  return request(`/projects/${id}`, { headers: authHeaders(token) });
}

export async function joinProject(id, token) {
  return request(`/projects/${id}/join`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export async function fetchProjectQuestionnaire(projectId, questionnaireId, token) {
  return request(`/projects/${projectId}/questionnaires/${questionnaireId}`, {
    headers: authHeaders(token),
  });
}

export async function submitProjectQuestionnaireResponse(
  projectId,
  questionnaireId,
  token,
  payload
) {
  return request(
    `/projects/${projectId}/questionnaires/${questionnaireId}/responses`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchClientProjects(token) {
  return request("/client/projects", { headers: authHeaders(token) });
}
